import output from './generated.json' assert {type: 'json'};
import {ComponentDefinition, ComponentModuleInfo} from './service.js';

interface ComponentJson {
    file: string;
    exportName: string;
    definition: ComponentDefinition;
}

function toComponentModuleInfo(item: ComponentJson): ComponentModuleInfo {
    return {
        definition: item.definition,
        load: () => import(item.file).then(module => module[item.exportName]),
    };
}
export const components = output.components.map(toComponentModuleInfo);
