import {
  hasPropertyChanged,
} from '../helpers/helpers.js';
import { SortyConfiguration } from '../config/config.js';
import {
  setCollectionManifest,
} from '../actions/selected-collection.js';
import {
  setDerivedManifests,
  setDerivedManifestsComplete,
  setClassifiedCanvases,
  resetDerivedManifests } from '../actions/loaded-manifest.js';
import { updateThumbsWithStatus } from './thumbs.js';
import { IIIFActions } from './iiif-actions.js';
import { getTerm } from '../config/terms.js';
import { OmekaActions, omekaServiceProfile } from './omeka-actions.js';
import {getOmekaToken} from "../helpers/oauth";

const $ = require('jquery');

const manifestSelector = '.manifest-select__dropdown';
const viewManifest = '.manifest-select__view-uv';

let store = null;
let manifestStore = null;
let lastLocalState = null;
let lastTitleText = null;

// const Config = {
//   deleteManifestModalOptions: {
//     delegate: '.action__delete',
//     items: {
//       src: '#deleteManifestmodal',
//       type: 'inline',
//     },
//     modal: true,
//   },
// };

const DOM = {
  init() {
    DOM.$classifiedMaterial = $('.classified-material');
    DOM.$classifiedTitle = $('.viewer__classified-title');
    // DOM.$deleteModalHeading = $('.manifest-modal--delete .manifest-modal__heading');
    // DOM.$deleteModalStatus = $('.manifest-modal--delete .manifest-modal__deleting-text');
    DOM.$manifestSelector = $(manifestSelector);
  },
};

const buildClassified = (derivedManifestList) => {
  // console.log('buildClassified', DOM.$classifiedMaterial != null &&
  if (DOM.$classifiedMaterial != null && DOM.$classifiedMaterial.length) {
    const preferredHeight = parseInt(localStorage.getItem('thumbSize'), 10);
    const preferredWidth = preferredHeight / 1.5;
    const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB'
    + 'CAQAAAC1HAwCAAAAC0lEQVR42mO8+R8AArcB2pIvCSwAAAAASUVORK5CYII=';

    DOM.$classifiedMaterial.html('');
    if (derivedManifestList && derivedManifestList.members) {
      for (let i = 0; i < derivedManifestList.members.length; i++) {
        const manifest = derivedManifestList.members[i];
        const label = manifest.label || manifest['@id'];

        // const publishToOmekaButton = SortyConfiguration.enableOmekaImport ?
        // `<li class="classified-manifest__actions-item">
        //   <a href="#" class="action__publish">
        //   <i class="material-icons">publish</i>Publish to Omeka
        //   </a>
        // </li>` : '';

        // const deleteButton = SortyConfiguration.enableDelete ?
        // `<li class="classified-manifest__actions-item">
        //   <a href="#" class="action__delete">
        //   <i class="material-icons">delete_forever</i>Delete this
        //   ${getTerm('derivedManifest', 1)}
        //   </a>
        // </li>` : '';



        DOM.$classifiedMaterial.append(`
          <div class="classified-manifest" data-id="${manifest['@id']}">
            <div class="classified-manifest__front classified-manifest__front--placeholder">
              <img src="${placeholder}" \
              height="${preferredHeight}" width="${preferredWidth}" />
            </div>
            <div class="classified-manifest__second classified-manifest__second--placeholder">
              <img src="${placeholder}" \
              height="${preferredHeight}" width="${preferredWidth}" />
            </div>
            <div class="classified-manifest__third classified-manifest__third--placeholder">
              <img src="${placeholder}" \
              height="${preferredHeight}" width="${preferredWidth}" />
            </div>
            <h2 class="classified-manifest__title">
              <span class="classified-manifest__title-text">${label}</span>
            </h2>
            <p class="classified-manifest__num">{x} images</p>
            <div class="classified-manifest__actions">
              <ul class="classified-manifest__actions-list">
                <li class="classified-manifest__actions-item">
                  <a href="http://universalviewer.io/?manifest=${manifest['@id']}"
                  class="action__view" target="_blank">
                  <i class="material-icons">open_in_new</i>View in the Universal Viewer
                  </a>
                </li>
                <li class="classified-manifest__actions-item">
                  <a href="${SortyConfiguration.madocServer}admin/item/${manifest['o:id']}"
                  class="action__view" target="_blank">
                  <i class="material-icons">open_in_new</i>Edit in Madoc
                  </a>
                </li>
              </ul>
            </div>
          </div>`);
      }
    }
  }
};

export const loadManifestPage = function loadManifestPage(manifestUrl) {
  window.open(`http://universalviewer.io/?manifest=${manifestUrl}`, '_blank');
};

const updateArchivalUnits = function () {
  const state = manifestStore.getState();
  // Make sure the list exists first
  if (state.derivedManifestsComplete.length) {
    if (DOM.$classifiedMaterial.find('.classified-manifest').length <
    state.derivedManifests.members.length) {
      buildClassified(state.derivedManifests);
    }

    DOM.$classifiedTitle.text(`${state.derivedManifestsComplete.length}
      ${getTerm('derivedManifest', state.derivedManifestsComplete.length)}`);

    for (const dm of state.derivedManifestsComplete) {
      const id = dm['@id'];
      const canvases = dm.sequences[0].canvases;
      // Add marker to indicate a dm has been loaded
      const $cmContainer = $(`.classified-manifest[data-id='${id}']`)
      .addClass('classified-manifest--loaded');
      $cmContainer.find('.classified-manifest__num')
      .text(`${canvases.length} images`);

      // Get publish to omeka status
      if (typeof dm.service !== 'undefined') {
        const services = Array.isArray(dm.service) ? dm.service : [dm.service];
        for (const service of services) {
          if (service.profile === omekaServiceProfile) {
            // Has been published
            $cmContainer.find('.action__publish')
            .replaceWith('<p class="classified-manifest__status">Published to Omeka</p>');
            break;
          }
        }
      }

      // TODO: DRY this out..
      const $cmImgFront = $cmContainer.find('.classified-manifest__front img');
      const $cmImgSecond = $cmContainer.find('.classified-manifest__second img');
      const $cmImgThird = $cmContainer.find('.classified-manifest__third img');
      if (canvases.length > 0 && canvases[0].images.length) {
        const imgSrcFront = $(`.thumb[data-uri='${canvases[0].images[0].on}']`).attr('data-src');
        $cmImgFront.attr('src', imgSrcFront)
        .removeClass('classified-manifest__front--placeholder');
      }
      if (canvases.length > 1 && canvases[1].images.length) {
        const imgSrcSecond = $(`.thumb[data-uri='${canvases[1].images[0].on}']`).attr('data-src');
        $cmImgSecond.attr('src', imgSrcSecond)
        .removeClass('classified-manifest__second--placeholder');
      } else {
        $cmImgSecond.hide();
      }
      if (canvases.length > 2 && canvases[2].images.length) {
        const imgSrcThird = $(`.thumb[data-uri='${canvases[2].images[0].on}']`).attr('data-src');
        $cmImgThird.attr('src', imgSrcThird)
        .removeClass('classified-manifest__third--placeholder');
      } else {
        $cmImgThird.hide();
      }
    }

    // Clean up - possible that derived manifests were listed but don't actually exist
    // Edge case
    $('.classified-manifest:not(.classified-manifest--loaded)').remove();
  }
};

// const cancelEdits = (resetText = false) => {
//   const $contentEditableTitleText = $('.classified-manifest__title-text[contenteditable]');
//   const $contentEditableTitle = $('.classified-manifest__title--edit');
//   $contentEditableTitleText.removeAttr('contenteditable');
//   $contentEditableTitle.removeClass('classified-manifest__title--edit');
//   if (resetText) $contentEditableTitleText.html(lastTitleText);
// };

const Events = {
  bodyClick(e) {
    if (
      e.target.className !== 'classified-manifest__title-edit' &&
      e.target.className !== 'classified-manifest__title-save' &&
      e.target.className !== 'material-icons'
    ) {
      // cancelEdits(true);
      $('body').off('click', Events.bodyClick);
    }
  },
  // delete(e) {
  //   e.preventDefault();
  //   // Use a modal here - Are you sure you want to delete?
  //   $.magnificPopup.open(Config.deleteManifestModalOptions);
  //
  //   // Grab manifest URL
  //   const $container = $(this).closest('.classified-manifest');
  //   const manifestId = $container.attr('data-id');
  //
  //   // Hook up delete button behaviour (remove any existing click events)
  //   const $deleteButton = $('.manifest-modal__delete').off('click');
  //   $deleteButton.click(() => {
  //     // Show delete indicator
  //     $('html').addClass('deleting-manifest');
  //
  //     $container.addClass('classified-manifest--deleting');
  //
  //     // Delete the manifest
  //     IIIFActions.deleteManifest(manifestId, Events.deleteSuccess, Events.deleteError);
  //   });
  // },
  // deleteError(/* xhr, textStatus,  error*/) {
  //   // console.log('ERROR DELETING', error);
  //   $('.classified-manifest--deleting').removeClass('classified-manifest--deleting');
  // },
  // deleteSuccess() {
  //   // Hide delete indicator
  //   $('html').removeClass('deleting-manifest');
  //
  //   // Kill the item stack
  //   $('.classified-manifest--deleting').remove();
  //
  //   // Close the modal
  //   $.magnificPopup.close();
  //
  //   // Fetch updated derived manifest data
  //   Events.getCreatedManifests();
  // },
  domReady() {
    DOM.init();
    // Set terms
    // DOM.$deleteModalHeading.html(`Are you sure you want to delete
    //   this ${getTerm('derivedManifest', 0)}?`);
    // DOM.$deleteModalStatus.html(`Deleting ${getTerm('derivedManifest', 0)}`);

    Events.init();
  },
  // editTitleClick() {
  //   // Cancel any other edit operations first
  //   cancelEdits(true);
  //
  //   // Make the title editable
  //   const $parentTitle = $(this).closest('.classified-manifest__title');
  //   $parentTitle.addClass('classified-manifest__title--edit');
  //
  //   const $editableText = $parentTitle.find('.classified-manifest__title-text');
  //
  //   lastTitleText = $editableText.text();
  //   $editableText.attr('contenteditable', 'true');
  //   $editableText.focus();
  //   $('body').click(Events.bodyClick);
  // },
  // editTitleKeypress(e) {
  //   if (e.key === 'Enter') {
  //     e.preventDefault();
  //     $(this).closest('.classified-manifest').find('.classified-manifest__title-save')
  //     .click();
  //   }
  // },
  getCreatedManifests() {
    // get the container in presley
    const collectionId = SortyConfiguration
      .getCollectionUri(manifestStore.getState().manifest);
    console.log('delivered-manifests.Events.getCreatedManifests', collectionId);
    $.getJSON(collectionId)
        .done(Events.requestDerivedManifestsSuccess)
        .fail(Events.requestDerivedManifestsFailure);
  },
  init() {
    // DOM.$classifiedMaterial.on('click',
    // '.classified-manifest__title-edit, .classified-manifest__title-text',
    // Events.editTitleClick);
    // DOM.$classifiedMaterial.on('click', '.classified-manifest__title-save', Events.saveTitleClick);
    // DOM.$classifiedMaterial.on('keypress',
    // '.classified-manifest__title--edit .classified-manifest__title-text',
    // Events.editTitleKeypress
    // );
    DOM.$classifiedMaterial.on('click', '.classified-manifest', (e) => e.stopPropagation());
    // DOM.$classifiedMaterial.on('click', '.action__publish', Events.publish);
    // DOM.$classifiedMaterial.on('click', '.action__delete', Events.delete);
    // DOM.$classifiedMaterial.magnificPopup(Config.deleteManifestModalOptions);
  },
  postError(xhr, textStatus, error) {
    console.log(error);
  },
  postSuccess() {
    cancelEdits();
    $('.classified-manifest--saving-label').removeClass('classified-manifest--saving-label');
  },
  postOmekaServiceError(xhr, textStatus, error) {
    console.log(error);
  },
  // publish(e) {
  //   e.preventDefault();
  //
  //   const oldHtml = $(this).html();
  //   $(this).html('loading...');
  //   getOmekaToken().then(({ accessToken }) => {
  //     const $container = $(this).closest('.classified-manifest');
  //     const manifestId = $container.attr('data-id');
  //     OmekaActions.pushToOmeka(manifestId, accessToken)
  //       .then(() => {
  //           // fulfilled
  //           OmekaActions.addOmekaService(manifestId).then(() => {
  //             Events.getCreatedManifests();
  //             $(this).html(oldHtml);
  //           });
  //         },
  //         () => {
  //           // rejected
  //           console.log('failed to push to omeka');
  //           // At the end.
  //           $(this).html('Failed to push to Omeka');
  //         });
  //   });
  // },
  putError(xhr, textStatus, error) {
    console.log(error);
  },
  putSuccess() {
    const manifest = store.getState().selectedCollection.collectionManifest;
    const newManifestInstance = Object.assign({}, manifest);
    newManifestInstance.sequences = null;
    newManifestInstance.service = null;
    IIIFActions.postCollection(
      manifest,
      SortyConfiguration.getCollectionUri(manifestStore.getState().manifest),
      SortyConfiguration.getCollectionAddUrl(),
      Events.postSuccess,
      Events.postError
    );
  },
  requestDerivedManifestsFailure() {
    manifestStore.dispatch(resetDerivedManifests());
    // If there's no derived manifest - just show the list
    console.log('requestDerivedManifestsFailure');
    $('html').addClass('manifest-loaded');
  },
  requestDerivedManifestsSuccess(collection) {
    // IIIF.wrap(collection);
    console.log('requestDerivedManifestsSuccess', collection);
    manifestStore.dispatch(setDerivedManifests(collection));
    // console.log('RDMS', collection);
    const promises = [];
    for (const dm of collection.members) {
      // console.log('dm', dm);
      promises.push(new Promise((resolve, reject) => {
        $.getJSON(dm['@id'])
        .done(resolve)
        .fail((jqxhr, textStatus, error) => {
          console.log(jqxhr, textStatus, error);
          if (jqxhr.status === 404) {
            resolve();
          } else {
            reject();
          }
        });
      }));
    }
    const classifiedCanvases = new Set();
    const classifiedManifests = [];
    Promise.all(promises).then(values => {
      for (const manifest of values) {
        if (typeof manifest !== 'undefined' && manifest !== null) {
          for (const canvas of manifest.sequences[0].canvases) {
            if (canvas.images.length) {
              classifiedCanvases.add(canvas.images[0].on);
            }
          }
          classifiedManifests.push(manifest);
        }
      }
      manifestStore.dispatch(setClassifiedCanvases(classifiedCanvases));
      manifestStore.dispatch(setDerivedManifestsComplete(classifiedManifests));

      $('html').addClass('dm-loaded manifest-loaded');
      updateThumbsWithStatus();
    }, reason => {
      console.log('Promise fail', reason);
    });
    $(viewManifest).click(Events.viewManifestClick);
  },
  // saveTitleClick() {
  //   const $parentTitle = $(this).closest('.classified-manifest__title');
  //   const $container = $(this).closest('.classified-manifest');
  //   const $editableText = $parentTitle.find('.classified-manifest__title-text');
  //   const manifestId = $container.attr('data-id');
  //   const titleText = $editableText.text();
  //   const derivedManifests = manifestStore.getState().derivedManifestsComplete;
  //   let manifestToUpdate = null;
  //   for (const dm of derivedManifests) {
  //     if (dm['@id'] === manifestId) {
  //       manifestToUpdate = dm;
  //       break;
  //     }
  //   }
  //   if (manifestToUpdate !== null) {
  //     // Update label
  //     manifestToUpdate.label = titleText;
  //     // Set saving state
  //     $container.addClass('classified-manifest--saving-label');
  //     // Store new manifest
  //     store.dispatch(setCollectionManifest(manifestToUpdate));
  //     // RE-PUT
  //     IIIFActions.addUpdateManifest(manifestToUpdate, Events.putSuccess, Events.putError);
  //   } else {
  //     // Cancel edit
  //     cancelEdits(true);
  //   }
  //   $('body').off('click', Events.bodyClick);
  // },
  subscribeActions() {
    const derivedState = manifestStore.getState();
    // console.log('DM - subscribe', lastLocalState, derivedState);
    if (hasPropertyChanged('derivedManifests', derivedState, lastLocalState)) {
      // console.log('DM - changed', derivedState);
      if (derivedState.derivedManifests.length) {
        const derivedManifestList = derivedState.derivedManifests;
        buildClassified(derivedManifestList);
      }
    }
    if (hasPropertyChanged('classifiedCanvases', derivedState, lastLocalState)) {
      // console.log('classifiedCanvases changed', derivedState, lastLocalState);
    }
    if (hasPropertyChanged('derivedManifestsComplete', derivedState, lastLocalState)) {
      // console.log('derivedManifestsComplete - updateArchivalUnits');
      updateArchivalUnits();
    }
    lastLocalState = derivedState;
  },
  viewManifestClick() {
    loadManifestPage(DOM.$manifestSelector.val());
  },
};

export const getCreatedManifests = Events.getCreatedManifests;

$(document).ready(Events.domReady);

export const derivedManifestsInit = (globalStore, globalManifestStore) => {
  store = globalStore;
  manifestStore = globalManifestStore;
  manifestStore.subscribe(Events.subscribeActions);
};
