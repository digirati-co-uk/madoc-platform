import {
  CanvasNormalized,
  CollectionNormalized,
  MetadataItem,
  TraversableEntityTypes,
  ManifestNormalized,
  InternationalString,
  ContentResource,
  Reference,
  ViewingDirection,
  CollectionItemSchemas,
  AnnotationPageNormalized,
  AnnotationPage,
} from '@hyperion-framework/types';
import { ServiceNormalized } from '@hyperion-framework/types/resources/service';
import { IIIFBuilder } from './iiif-builder';

export class BaseEntityBuilder<
  T extends ManifestNormalized | CollectionNormalized | CanvasNormalized | AnnotationPageNormalized
> {
  builder: IIIFBuilder;
  entity: T;
  protected modified: Set<string> = new Set();
  protected newInstances: BaseEntityBuilder<any>[] = [];
  protected editedInstances: BaseEntityBuilder<any>[] = [];
  protected embeddedInstances: any[] = [];

  get id() {
    return this.entity.id;
  }

  reset(entity: T) {
    this.entity = entity;
    this.modified = new Set();
    this.embeddedInstances = [];
    this.editedInstances = [];
    this.newInstances = [];
  }

  dispose() {
    // Method used only to prevent implementations from holding on to references and
    // keeping these classes in memory.
    for (const canvasBuilder of this.newInstances) {
      canvasBuilder.dispose();
    }
    for (const canvasEditor of this.editedInstances) {
      canvasEditor.dispose();
    }
    (this.builder as any) = null;
    (this.entity as any) = null;
    (this.modified as any) = null;
    (this.newInstances as any) = null;
    (this.editedInstances as any) = null;
  }

  constructor(builder: IIIFBuilder, entity: T) {
    this.builder = builder;
    this.entity = { ...entity };
  }

  getEmbeddedInstances() {
    const embedded: any[] = [];
    for (const instance of this.editedInstances) {
      embedded.push(...instance.getEmbeddedInstances());
    }

    embedded.push(...this.embeddedInstances);

    return embedded;
  }

  getModifiedFields() {
    const modifiedFields: Array<{
      id: string;
      type: TraversableEntityTypes;
      key: string;
      value: any;
    }> = [];

    for (const instance of this.editedInstances) {
      modifiedFields.push(...instance.getModifiedFields());
    }

    for (const modified of this.modified.values()) {
      const field = (this.entity as any)[modified];
      modifiedFields.push({
        id: this.entity.id,
        type: this.entity.type,
        value: field,
        key: modified,
      });
    }

    return modifiedFields;
  }

  getModifiedEntities() {
    const modifiedEntities: any[] = [];

    for (const instance of this.editedInstances) {
      modifiedEntities.push(...instance.getNestedEntities());
      modifiedEntities.push(instance.entity);
    }

    return modifiedEntities;
  }

  getNestedEntities() {
    const nestedEntities: any[] = [];

    for (const canvasBuilder of this.newInstances) {
      nestedEntities.push(...canvasBuilder.getNestedEntities());
      nestedEntities.push(canvasBuilder.entity);
    }

    for (const instance of this.editedInstances) {
      nestedEntities.push(...instance.getEmbeddedInstances());
    }
    nestedEntities.push(...this.embeddedInstances);

    return nestedEntities;
  }

  // Descriptive and rights
  // ❌  navDate - not supported by Madoc
  // ❌  language - not supported by Madoc
  // ❌  provider - not supported by Madoc
  // ❌  placeholderCanvas - not supported by Madoc
  // ❌  accompanyingCanvas - not supported by Madoc
  // ✅  label
  set label(value: InternationalString) {
    this.setLabel(value);
  }

  setLabel(label: InternationalString) {
    this.modified.add('label');
    this.entity.label = label;
  }

  addLabel(label: string | string[], language?: string) {
    this.addLanguageProperty('label', label, language);
  }

  // ✅  metadata
  set metadata(metadata: MetadataItem[]) {
    this.setMetadata(metadata);
  }

  setMetadata(metadata: MetadataItem[]) {
    this.modified.add('metadata');
    this.entity.metadata = metadata;
  }

  addMetadata(label: InternationalString, value: InternationalString) {
    this.modified.add('metadata');
    this.entity.metadata = [
      ...this.entity.metadata,
      {
        label,
        value,
      },
    ];
  }

  // ✅  summary
  set summary(value: InternationalString) {
    this.setLabel(value);
  }

  setSummary(summary: InternationalString) {
    this.modified.add('summary');
    this.entity.summary = summary;
  }

  addSummary(summary: string | string[], language?: string) {
    this.addLanguageProperty('summary', summary, language);
  }

  // ✅  requiredStatement
  set requiredStatement(statement: { label: InternationalString; value: InternationalString }) {
    this.setRequiredStatement(statement);
  }

  setRequiredStatement(statement: { label: InternationalString; value: InternationalString }) {
    this.modified.add('requiredStatement');
    this.entity.requiredStatement = statement;
  }

  // ✅  rights
  set rights(text: string) {
    this.setRights(text);
  }

  setRights(text: string) {
    this.modified.add('rights');
    this.entity.rights = text;
  }

  // ✅  thumbnail
  addThumbnail(resource: ContentResource) {
    this.modified.add('thumbnail');
    this.entity.thumbnail = [...this.entity.thumbnail, this.addEmbeddedInstance(resource, 'ContentResource')];
  }

  // Technical properties
  // ✅  id - supported, but immutable in this context
  // ✅  type - supported, but immutable in this context
  // ❌  format - not supported in madoc, only used for content resources
  // ❌  profile - not supported in madoc, only used for content resources
  // ❌  timeMode - only used on annotations, which are not supported by Madoc

  // ✅  height
  set height(height: number) {
    this.setHeight(height);
  }

  setHeight(height: number) {
    if (this.isCanvas(this.entity)) {
      this.modified.add('height');
      this.entity.height = height;
    }
  }

  // ✅  width
  set width(width: number) {
    this.setWidth(width);
  }

  setWidth(width: number) {
    if (this.isCanvas(this.entity)) {
      this.modified.add('width');
      this.entity.width = width;
    }
  }

  // ✅  duration
  set duration(duration: number) {
    this.setDuration(duration);
  }

  setDuration(duration: number) {
    if (this.isCanvas(this.entity)) {
      this.modified.add('duration');
      this.entity.duration = duration;
    }
  }

  set viewingDirection(dir: string | number) {
    this.setViewingDirection(dir);
  }

  // ✅  viewingDirection
  setViewingDirection(dir: string | number) {
    if (this.isManifest(this.entity)) {
      let viewDir: ViewingDirection = 'left-to-right';
      switch (dir) {
        case 'left-to-right':
        case 0:
          viewDir = 'left-to-right';
          break;
        case 'right-to-left':
        case 1:
          viewDir = 'right-to-left';
          break;
        case 'top-to-bottom':
        case 2:
          viewDir = 'top-to-bottom';
          break;
        case 'bottom-to-top':
        case 3:
          viewDir = 'bottom-to-top';
          break;
      }
      this.modified.add('viewingDirection');
      this.entity.viewingDirection = viewDir;
    }
  }

  // ✅  behavior
  set behavior(behavior: string | string[]) {
    this.setBehavior(behavior);
  }
  set behaviour(behavior: string | string[]) {
    this.setBehavior(behavior);
  }

  setBehavior(behavior: string | string[]) {
    this.modified.add('behavior');
    this.entity.behavior = Array.isArray(behavior) ? behavior : [behavior];
  }

  setBehaviour(behavior: string | string[]) {
    this.setBehavior(behavior);
  }

  addBehaviour(behavior: string) {
    this.addBehavior(behavior);
  }

  addBehavior(behavior: string) {
    this.modified.add('behavior');
    this.entity.behavior = [...this.entity.behavior, behavior];
  }

  // Linking properties
  // ❌  supplementary - only supported on ranges, which Madoc does not support

  // ✅  seeAlso
  set seeAlso(seeAlso: ContentResource[]) {
    this.setSeeAlso(seeAlso);
  }

  setSeeAlso(seeAlso: ContentResource[]) {
    this.modified.add('seeAlso');
    this.entity.seeAlso = seeAlso.map(e => this.addEmbeddedInstance(e, 'ContentResource'));
  }

  addSeeAlso(seeAlso: ContentResource) {
    this.modified.add('seeAlso');
    this.entity.seeAlso = [...this.entity.seeAlso, this.addEmbeddedInstance(seeAlso, 'ContentResource')];
  }

  // ✅  service
  set service(service: ServiceNormalized[]) {
    this.setService(service);
  }

  addServiceProperty(service: ServiceNormalized) {
    this.modified.add('service');
    this.entity.service = [...this.entity.service, service];
  }

  setService(service: ServiceNormalized[]) {
    this.modified.add('service');
    this.entity.service = service;
  }

  // ✅  homepage
  set homepage(homepage: ContentResource) {
    this.setHomepage(homepage);
  }

  setHomepage(homepage: ContentResource) {
    this.modified.add('homepage');
    this.entity.homepage = this.addEmbeddedInstance(homepage, 'ContentResource');
  }

  // ✅  rendering
  set rendering(rendering: ContentResource[]) {
    this.setRendering(rendering);
  }

  setRendering(rendering: ContentResource[]) {
    this.modified.add('rendering');
    this.entity.rendering = rendering.map(e => this.addEmbeddedInstance(e, 'ContentResource'));
  }

  addRendering(rendering: ContentResource) {
    this.modified.add('rendering');
    this.entity.rendering = [...this.entity.rendering, this.addEmbeddedInstance(rendering, 'ContentResource')];
  }

  // ✅  partOf
  set partOf(partOf: Reference<CollectionItemSchemas>[]) {
    this.setPartOf(partOf);
  }

  setPartOf(partOf: Reference<CollectionItemSchemas>[]) {
    if (this.isManifest(this.entity) || this.isCanvas(this.entity)) {
      this.modified.add('partOf');
      this.entity.partOf = partOf;
    }
  }

  isPartOf(partOf: Reference<CollectionItemSchemas>) {
    if (this.isManifest(this.entity) || this.isCanvas(this.entity)) {
      this.modified.add('partOf');
      this.entity.partOf = [...this.entity.partOf, partOf];
    }
  }

  // ✅  start
  set start(start: Reference<'Canvas' | 'Selector'>) {
    this.setStart(start);
  }

  setStart(start: Reference<'Canvas' | 'Selector'>) {
    if (this.isManifest(this.entity)) {
      this.entity.start = start;
    }
  }

  addAnnotations(annotationPage: AnnotationPage) {
    if (this.isCanvas(this.entity)) {
      this.modified.add('annotations');
      this.entity.annotations = [
        ...this.entity.annotations,
        this.addEmbeddedInstance(annotationPage, 'AnnotationPage'),
      ];
    }
  }

  // ✅  services
  set services(services: ServiceNormalized[]) {
    this.setServices(services);
  }

  addServicesProperty(service: ServiceNormalized) {
    if (this.isManifest(this.entity)) {
      this.modified.add('services');
      this.entity.services = [...this.entity.services, service];
    }
  }

  setServices(services: ServiceNormalized[]) {
    if (this.isManifest(this.entity)) {
      this.modified.add('services');
      this.entity.services = services;
    }
  }

  // Structural
  // ✅  items - but these are handled by individual classes.
  // ❌  structures - Not supported at the moment
  // ❌  annotations - Not supported at the moment

  // Utilities.
  addEmbeddedInstance(item: any, type?: string): Reference<any> {
    this.embeddedInstances.push(item);
    return {
      id: item.id,
      type: type ? type : item.type,
    };
  }

  isAnnotationPage(entity: any): entity is AnnotationPageNormalized {
    return entity.type === 'AnnotationPage';
  }

  isCanvas(entity: any): entity is CanvasNormalized {
    return entity.type === 'Canvas';
  }

  isManifest(entity: any): entity is ManifestNormalized {
    return entity.type === 'Manifest';
  }

  addLanguageProperty(name: 'label' | 'summary', value: string | string[], language = 'none') {
    if (typeof this.entity[name] !== 'undefined') {
      this.modified.add(name);
      this.entity[name] = this.entity[name] ? this.entity[name] : {};
      (this.entity[name] as any)[language] = Array.isArray(value) ? value : [value];
    } else {
      throw new Error(`Invalid field "${name}"`);
    }
  }
}
