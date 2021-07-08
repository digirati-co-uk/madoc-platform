import mitt from 'mitt';

const GLOBAL_EMITTER = mitt();

const PRE_EVENTS: Array<{ type: string; data: any }> = [];

// We want to catch events before construct potentially.
GLOBAL_EMITTER.on('*', (type, data) => {
  PRE_EVENTS.push({ type, data } as any);
});

export abstract class RegistryExtension<
  ExtensionDefinition extends { type: string; source?: { type: string; id?: string; name: string } } = any
> {
  static emitter = GLOBAL_EMITTER;

  registryName: string;

  definitionMap: {
    [type: string]: ExtensionDefinition;
  } = {};
  pluginDefinitions: {
    [type: string]: Array<{
      siteId?: number;
      pluginId: string;
      definition: ExtensionDefinition;
    }>;
  } = {};

  dispose(): void {
    RegistryExtension.emitter.off(this.registryName, this.create as any);
    RegistryExtension.emitter.off(`plugin-${this.registryName}`, this.createPlugin as any);
    RegistryExtension.emitter.off(`remove-plugin-${this.registryName}`, this.removePlugin as any);
  }

  create = (definition: ExtensionDefinition) => {
    this.definitionMap[definition.type] = definition;
  };

  createPlugin = ({
    pluginId,
    siteId,
    definition,
  }: {
    pluginId: string;
    siteId?: number;
    definition: ExtensionDefinition;
  }) => {
    this.pluginDefinitions[definition.type] = this.pluginDefinitions[definition.type]
      ? this.pluginDefinitions[definition.type]
      : [];
    for (const pluginBlock of this.pluginDefinitions[definition.type]) {
      if (pluginBlock.pluginId === pluginId && pluginBlock.siteId === siteId) {
        // Overriding definition.
        pluginBlock.definition = definition;
        return;
      }
    }
    this.pluginDefinitions[definition.type].push({
      siteId,
      pluginId,
      definition,
    });
  };

  removePlugin = ({ type, pluginId, siteId }: { type: string; pluginId: string; siteId?: number }) => {
    const allDefinitions = this.pluginDefinitions[type];
    if (allDefinitions) {
      this.pluginDefinitions[type] = this.pluginDefinitions[type].filter(
        def => !(def.pluginId === pluginId && def.siteId === siteId)
      );
    }
  };

  protected constructor(config: { registryName: string }) {
    this.registryName = config.registryName;

    RegistryExtension.emitter.on(config.registryName, this.create as any);
    RegistryExtension.emitter.on(`plugin-${config.registryName}`, this.createPlugin as any);
    RegistryExtension.emitter.on(`remove-plugin-${config.registryName}`, this.removePlugin as any);

    for (const preEvent of PRE_EVENTS) {
      switch (preEvent.type) {
        case config.registryName:
          this.create(preEvent.data);
          break;
        case `plugin-${config.registryName}`:
          this.createPlugin(preEvent.data);
          break;
        case `remove-plugin-${config.registryName}`:
          this.removePlugin(preEvent.data);
          break;
        default:
          break;
      }
    }
  }

  getDefinition(type: string, siteId: number) {
    // Check plugin blocks.
    const types = this.pluginDefinitions[type];
    if (types) {
      const found = types.find(r => r.siteId === siteId)?.definition;
      if (found) {
        return found;
      }
    }

    return this.definitionMap[type];
  }

  getAllDefinitions(siteId: number): ExtensionDefinition[] {
    // Configuration blocks.
    const definitions = Object.values(this.definitionMap);
    const pluginDefinitionKeys = Object.keys(this.pluginDefinitions);
    for (const pluginDefinitionKey of pluginDefinitionKeys) {
      const defs = this.pluginDefinitions[pluginDefinitionKey];
      if (defs) {
        const found = defs.find(def => def.siteId === siteId);
        if (found) {
          definitions.push(found.definition);
        }
      }
    }

    return definitions;
  }
}
