/// <reference types="jest" />

import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  Schema as ApplicationOptions,
  Style,
} from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';
import { InMemoryFileSystemHost, Project } from 'ts-morph';
import ts from 'typescript';
import {
  createNewConfig,
  getConfig,
  getConfigs,
  getExistingStorefrontConfigNode,
  mergeConfig,
} from './config-utils';
import { commitChanges, getTsSourceFile } from './file-utils';

const collectionPath = path.join(__dirname, '../../collection.json');
const schematicRunner = new SchematicTestRunner('schematics', collectionPath);

// TODO:#10744 - cleanup after implementing the new config utils.
xdescribe('Storefront config utils', () => {
  let appTree: UnitTestTree;
  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    version: '0.5.0',
  };
  const appOptions: ApplicationOptions = {
    name: 'schematics-test',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: false,
    projectRoot: '',
  };
  const defaultOptions = {
    project: 'schematics-test',
  };
  const appModulePath = 'src/app/app.module.ts';

  beforeEach(async () => {
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        appOptions,
        appTree
      )
      .toPromise();
    appTree = await schematicRunner
      .runSchematicAsync('add-spartacus', defaultOptions, appTree)
      .toPromise();
  });

  describe('getExistingStorefrontConfigNode', () => {
    it('should get the Storefront config from app.module.ts file', async () => {
      const appModuleFile = getTsSourceFile(appTree, appModulePath);
      const config = getExistingStorefrontConfigNode(
        appModuleFile
      ) as ts.CallExpression;

      expect(config).toBeTruthy();
      expect(config.getFullText()).toContain('B2cStorefrontModule.withConfig');
    });
  });

  describe('getConfig', () => {
    it('should return the specified config from Storefront CallExpression AST node object', async () => {
      const appModuleFile = getTsSourceFile(appTree, appModulePath);
      const config = getExistingStorefrontConfigNode(
        appModuleFile
      ) as ts.CallExpression;
      const currentContextConfig = getConfig(config, 'context');

      expect(currentContextConfig).toBeTruthy();
      expect(currentContextConfig?.getFullText()).toContain('currency:');
    });

    it('should return an undefined if the provided configName was not found', async () => {
      const appModuleFile = getTsSourceFile(appTree, appModulePath);
      const config = getExistingStorefrontConfigNode(
        appModuleFile
      ) as ts.CallExpression;
      const configByName = getConfig(config, 'test');

      expect(configByName).toBeFalsy();
      expect(configByName).toEqual(undefined);
    });
  });

  describe('mergeConfig', () => {
    it('should merge the provided config array', async () => {
      const appModuleFile = getTsSourceFile(appTree, appModulePath);
      const config = getExistingStorefrontConfigNode(
        appModuleFile
      ) as ts.CallExpression;
      const currentContextConfig = getConfig(
        config,
        'context'
      ) as ts.PropertyAssignment;
      const currencyChange = mergeConfig(
        appModulePath,
        currentContextConfig,
        'currency',
        ['EUR', 'JPY']
      );

      expect(appTree.readContent(appModulePath)).not.toContain('EUR');
      expect(appTree.readContent(appModulePath)).not.toContain('JPY');

      commitChanges(appTree, appModulePath, [currencyChange]);

      expect(appTree.readContent(appModulePath)).toContain('EUR');
      expect(appTree.readContent(appModulePath)).toContain('JPY');
    });

    it('should merge the provided regular config', async () => {
      const appModuleFile = getTsSourceFile(appTree, appModulePath);
      const config = getExistingStorefrontConfigNode(
        appModuleFile
      ) as ts.CallExpression;
      const backendConfig = getConfig(
        config,
        'backend'
      ) as ts.PropertyAssignment;

      const change = mergeConfig(appModulePath, backendConfig, 'occ', 'random');

      expect(appTree.readContent(appModulePath)).not.toContain('random');
      commitChanges(appTree, appModulePath, [change]);
      expect(appTree.readContent(appModulePath)).toContain('random');
    });

    it('should create a new config if there is nothing to be mergex', async () => {
      const appModuleFile = getTsSourceFile(appTree, appModulePath);
      const config = getExistingStorefrontConfigNode(
        appModuleFile
      ) as ts.CallExpression;
      const currentContextConfig = getConfig(
        config,
        'context'
      ) as ts.PropertyAssignment;
      const baseSiteChange = mergeConfig(
        appModulePath,
        currentContextConfig,
        'urlParameters',
        ['baseSite', 'language', 'currency']
      );

      expect(appTree.readContent(appModulePath)).not.toContain(
        'urlParameters:'
      );

      commitChanges(appTree, appModulePath, [baseSiteChange]);

      expect(appTree.readContent(appModulePath)).toContain('urlParameters:');
    });
  });

  describe('createNewConfig', () => {
    it('should nest the given new config in the given config object', async () => {
      const appModuleFile = getTsSourceFile(appTree, appModulePath);
      const config = getExistingStorefrontConfigNode(
        appModuleFile
      ) as ts.CallExpression;
      const currentContextConfig = getConfig(
        config,
        'context'
      ) as ts.PropertyAssignment;
      const testConfigChange = createNewConfig(
        appModulePath,
        currentContextConfig,
        'testObjectConfig',
        ['value1', 'value2']
      );

      expect(appTree.readContent(appModulePath)).not.toContain(
        'testObjectConfig:'
      );

      commitChanges(appTree, appModulePath, [testConfigChange]);

      expect(appTree.readContent(appModulePath)).toContain('testObjectConfig:');
      expect(appTree.readContent(appModulePath)).toContain('value1');
      expect(appTree.readContent(appModulePath)).toContain('value2');
    });
  });

  describe('getConfigs', () => {
    it('should return all configs from provideConfigs calls', () => {
      const content = `
import { NgModule } from '@angular/core';
import {
  CartAddEntrySuccessEvent,
  CartRemoveEntrySuccessEvent,
  provideConfig,
} from '@spartacus/core';
import { NavigationEvent } from '@spartacus/storefront';
import { PersonalizationRootModule } from '@spartacus/tracking/personalization/root';
import { AepModule } from '@spartacus/tracking/tms/aep';
import { BaseTmsModule, TmsConfig } from '@spartacus/tracking/tms/core';
import { GtmModule } from '@spartacus/tracking/tms/gtm';

@NgModule({
  imports: [
    BaseTmsModule.forRoot(),
    GtmModule,
    AepModule,
    PersonalizationRootModule,
  ],
  providers: [
    provideConfig(<TmsConfig>{
      tagManager: {
        gtm: {
          events: [NavigationEvent, CartAddEntrySuccessEvent],
        },
        aep: {
          events: [NavigationEvent, CartRemoveEntrySuccessEvent],
        },
      },
    }),
    provideConfig({
      featureModules: {
        personalization: {
          module: () =>
            import('@spartacus/tracking/personalization').then(
              (m) => m.PersonalizationModule
            ),
        },
      },
    }),
  ],
})
export class TrackingFeatureModule {}
`;
      const project = new Project({
        fileSystem: new InMemoryFileSystemHost(),
      });
      const sourceFile = project.createSourceFile('test.ts', content);
      const configs = getConfigs(sourceFile);
      expect(configs.length).toEqual(2);
      expect(configs[0].getText()).toMatchSnapshot();
      expect(configs[1].getText()).toMatchSnapshot();
    });
  });
});
