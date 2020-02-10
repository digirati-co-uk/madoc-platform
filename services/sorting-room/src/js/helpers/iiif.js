function jsonLdTidy(obj, propNames) {
  propNames.forEach((pn) => {
    Object.defineProperty(obj, pn, {
      get() {
        return this[`@${pn}`];
      },
      set(value) {
        this[`@${pn}`] = value;
      },
    });
  });
}

function getScale(box, width, height) {
  const scaleW = box / width;
  const scaleH = box / height;
  return Math.min(scaleW, scaleH);
}

function fits(size, min, max) {
  if (size.width && size.height) {
    return (size.width >= min || size.height >= min) && (size.width <= max && size.height <= max);
  }
  return null;
}

function getDistance(size, preferred) {
  const box = Math.max(size.width, size.height);
  return Math.abs(preferred - box);
}

function getCanonicalUri(imageService, width, height) {
  // TODO - this is not correct, it's a placeholder...
  return `${imageService.id}/full/${width},${height}/0/default.jpg`;
}

function makeThumb(preferred, size, url) {
  const scale = getScale(preferred, size.width, size.height);
  return {
    url,
    width: Math.round(scale * size.width),
    height: Math.round(scale * size.height),
    actualWidth: size.width,
    actualHeight: size.height,
  };
}

function getThumbnailFromServiceSizes(service, preferred, min, max) {
  // this will return a thumbnail between min and max
  const sizes = service.sizes;
  sizes.sort((a, b) => a.width - b.width);
  let best = null;
  let distance = Number.MAX_SAFE_INTEGER;
  for (let i = sizes.length - 1; i >= 0; i--) {
    // start with the biggest; see if each one matches criteria.
    const size = sizes[i];
    if (fits(size, min, max)) {
      const sizeDist = getDistance(size, preferred);
      if (sizeDist < distance) {
        best = size;
      }
      distance = sizeDist;
    } else {
      if (best) break;
    }
  }
  if (best) {
    const url = getCanonicalUri(service, best.width, best.height);
    return makeThumb(preferred, best, url);
  }
  return null;
}

function isImageService(service) {
  if (typeof service === 'object' && service && service.profile) {
    if (service.profile.asArray()[0].indexOf('http://iiif.io/api/image') !== -1) {
      return true;
    }
  }
  return false;
}

function hasSizes(service) {
  return service && isImageService(service) && service.sizes && service.sizes.length;
}


function getThumbnailFromTileOnlyLevel0ImageService(imgService, preferred) { // , min, max, follow
  // check for level 0 with tiles only - ask for a small tile
  // unless there's enough info inline, will need to dereference info.json to determine tile sizes
  // we have already checked for sizes
  // TODO - this is not a complete implementation yet, assumes we have the width and height
  // (we would if derefed),
  // TODO - assumes only one set of tiles
  if (imgService.tiles) {
    const size = Math.max(imgService.width, imgService.height);
    // now we need to find a tile that the whole image fits on
    const tileWidth = imgService.tiles[0].width; // assume square for now
    imgService.tiles[0].scaleFactors.sort((a, b) => (a - b));
    for (let i = 0; i < imgService.tiles[0].scaleFactors.length; i++) {
      const scaleFactor = imgService.tiles[0].scaleFactors[i];
      const s = size / scaleFactor;
      if (s <= tileWidth) {
        // this is not right...
        const width = Math.round(imgService.width / scaleFactor);
        const url = `${imgService.id}/full/${width},/0/default.jpg`;
        const thumbSize = {
          width: Math.round(imgService.width / scaleFactor),
          height: Math.round(imgService.height / scaleFactor),
        };
        return makeThumb(preferred, thumbSize, url);
      }
    }
  }

  // TODO: follow is not implemented - but if it was, the full info.json would be dereferenced here.
  // if the dereferenced info.json has 'sizes' use those, otherwise use tiles as above

  return null;
}

function getThumbnailFromImageResource(image, preferred, min, max, canvas) {
  let pref = preferred;
  let thumbnail = null;
  if (typeof image === 'string') {
    // A thumbnail has been supplied but we have no idea how big it is
    if (pref <= 0) {
      thumbnail = { url: image }; // caller didn't care
    }
  } else if (image.service) {
    let imgService = image.service.first(hasSizes);
    if (imgService) {
      thumbnail = getThumbnailFromServiceSizes(imgService, pref, min, max);
    } else {
      imgService = image.service.first(isImageService);
      if (imgService) {
        if (imgService.profile.asArray()[0].indexOf('level0.json') !== -1) {
          thumbnail = getThumbnailFromTileOnlyLevel0ImageService(imgService, pref, min, max);
        } else {
          // attempt to determine the aspect ratio
          const size = {
            width: imgService.width || image.width || canvas.width,
            height: imgService.height || image.height || canvas.height,
          };
          if (pref <= 0) {
            // we can't supply 0!
            pref = 200;
          }
          thumbnail = makeThumb(pref, size);
          thumbnail.url = getCanonicalUri(imgService, thumbnail.width, thumbnail.height);
          thumbnail.actualWidth = thumbnail.width;
          thumbnail.actualHeight = thumbnail.height;
        }
      }
    }
  } else {
    const imageResourceSize = {
      width: image.width,
      height: image.height,
    };
    if (pref <= 0 || fits(imageResourceSize, min, max)) {
      thumbnail = makeThumb(pref, imageResourceSize, image.id);
    }
  }
  return thumbnail;
}


function getThumbnail(preferred, minimum, maximum) { // , follow
  let max = maximum;
  const min = minimum;
  if (!maximum) max = 3 * (min || 100);
  let thumbnail;
  if (this.hasOwnProperty('thumbnail')) {
    thumbnail = getThumbnailFromImageResource(this.thumbnail, preferred, min, max);
    if (thumbnail) {
      return thumbnail;
    }
  }
  // no explicit thumbnail. Now we need to take a look at what this actually is
  if (this.type === 'dctypes:Image') {
    thumbnail = getThumbnailFromImageResource(this, preferred, min, max);
    if (thumbnail) {
      return thumbnail;
    }
  }
  if (this.type === 'sc:Canvas' && this.images && this.images.length && this.images[0].resource) {
    // console.log(this.images[0].resource);
    thumbnail = getThumbnailFromImageResource(this.images[0].resource, preferred, min, max, this);
    if (thumbnail) {
      return thumbnail;
    }
  }
  return null;
}


// TODO - better handling of multiple images per canvas
function getDefaultImageService() {
  // on sc:Canvas
  let imgService = null;
  if (this.images) {
    this.images.forEach((img) => {
      if (img.resource && img.resource.service) {
        imgService = img.resource.service.first(isImageService);
        if (imgService) return imgService;
      }
      return false;
    });
  }
  return imgService;
}

function findIndexById(id) {
  let idx;
  for (idx = 0; idx < this.length; idx++) {
    if (id === this[idx]['@id']) {
      return idx;
    }
  }
  return -1;
}

export const IIIF = {};

/* eslint no-extend-native: ["error", { "exceptions": ["String"] }]*/
String.prototype.asArray = function () {
  return [this];
};

IIIF.wrap = function wrap(rawObj, key) {
  let newObj;
  if (!!rawObj) {
    newObj = rawObj;
    if (typeof (newObj) === 'object') {
      if (newObj.constructor !== Array) {
        jsonLdTidy(newObj, ['id', 'type', 'context']);
        if (newObj.hasOwnProperty('@type') && newObj['@type'].indexOf('sc:') === 0) {
          newObj.getThumbnail = getThumbnail; // for all IIIF types
          if (newObj['@type'] === 'sc:Canvas') {
            newObj.getDefaultImageService = getDefaultImageService; // only for Canvas
          }
        }
      }
      if (key === 'canvases') {
        // We could do this for more than just canvases. But for now..
        newObj.findIndexById = findIndexById;
      }
      for (const prop of Object.keys(newObj)) {
        IIIF.wrap(newObj[prop], prop);
      }
      // add helpers for non-@container JSON-LD keys
      newObj.asArray = function asArray() { return (this.constructor === Array) ? this : [this]; };
      newObj.where = function where(predicate) { return this.asArray().filter(predicate); };
      newObj.first = function first(predicate) {
        let taa = this.asArray();
        // console.log('taa', taa);
        if (predicate) {
          taa = taa.filter(predicate);
        }
        return taa.length ? taa[0] : null;
      };
      newObj.any = function any(predicate) {
        // console.log(this, predicate);
        return this.first(predicate);
      };
      if (typeof (rawObj) === 'object') {
        // prevent our helpers appearing as enumerable props
        Object.defineProperty(rawObj, 'asArray', { enumerable: false });
        Object.defineProperty(rawObj, 'where', { enumerable: false });
        Object.defineProperty(rawObj, 'first', { enumerable: false });
        Object.defineProperty(rawObj, 'any', { enumerable: false });
      }
    } else if (key === 'profile' || key === 'service' && typeof (newObj) === 'string') {
      // required for services, profiles etc as strings
      // console.log(`$string... ${newObj}`);
      // newObj.asArray = function asArray() { return [this]; };
    }
  }
};

IIIF.getAuthServices = function getAuthServices(info) {
  const svcInfo = {};
  let services = [];
  if (info.hasOwnProperty('service')) {
    if (info.service.constructor === Array) {
      services = info.service;
    } else {
      services = [info.service];
    }

    const prefix = 'http://iiif.io/api/auth/0/';
    const clickThrough = 'http://iiif.io/api/auth/0/login/clickthrough';

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      let serviceName = null;

      if (service.profile === clickThrough) {
        serviceName = 'clickthrough';
        // console.log('Found click through service');
        svcInfo[serviceName] = {
          id: service['@id'],
          label: service.label,
          description: service.description,
          confirmLabel: 'Accept terms and Open', // fake this for now
        };
      } else if (service.profile.indexOf(prefix) === 0) {
        serviceName = service.profile.slice(prefix.length);
        // console.log('Found ' + serviceName + ' auth service');
        svcInfo[serviceName] = { id: service['@id'], label: service.label };
      }
      if (service.service && serviceName) {
        let nestedServices = [];
        if (service.service.constructor === Array) {
          nestedServices = service.service;
        } else {
          nestedServices = [service.service];
        }

        for (let j = 0; j < nestedServices.length; j++) {
          const nestedServiceName = nestedServices[j].profile.slice(prefix.length);
          // console.log('Found nested ' + nestedServiceName + ' auth service');
          svcInfo[serviceName][nestedServiceName] = {
            id: nestedServices[j]['@id'],
            label: nestedServices[j].label };
        }
      }
    }
  }
  return svcInfo;
};
