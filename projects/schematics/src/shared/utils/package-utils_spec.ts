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
import { ANGULAR_CORE, UTF_8 } from '../constants';
import {
  getAngularVersion,
  getMajorVersionNumber,
  getSpartacusCurrentFeatureLevel,
  getSpartacusSchematicsVersion,
  readPackageJson,
} from './package-utils';

const collectionPath = path.join(__dirname, '../../collection.json');
const schematicRunner = new SchematicTestRunner('schematics', collectionPath);

describe('Package utils', () => {
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

  describe('readPackageJson', () => {
    it('should return parsed package.json content', async () => {
      const buffer = appTree.read('package.json');

      if (buffer) {
        const packageJsonObject = JSON.parse(buffer.toString(UTF_8));
        expect(packageJsonObject).toEqual(readPackageJson(appTree));
      }
    });
  });

  describe('getAngularVersion', () => {
    it('should return angular version', async () => {
      const testVersion = '5.5.5';
      const buffer = appTree.read('package.json');

      if (buffer) {
        const packageJsonObject = JSON.parse(buffer.toString(UTF_8));
        packageJsonObject.dependencies[ANGULAR_CORE] = testVersion;
        appTree.overwrite('package.json', JSON.stringify(packageJsonObject));
        const version = getAngularVersion(appTree);
        expect(version).toEqual(testVersion);
      }
    });
  });

  describe('getMajorVersionNumber', () => {
    it('should return the major number', () => {
      const testVersion = '9.0.0';
      const majorVersion = getMajorVersionNumber(testVersion);
      expect(majorVersion).toEqual(9);
    });
    it('should return the major number even if the version string starts with a character', () => {
      const testVersion = '^9.0.0';
      const majorVersion = getMajorVersionNumber(testVersion);
      expect(majorVersion).toEqual(9);
    });
  });

  describe('getSpartacusSchematicsVersion', () => {
    it('should return spartacus version', async () => {
      const version = getSpartacusSchematicsVersion();
      expect(version).toBeTruthy();
      expect(version.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getSpartacusCurrentFeatureLevel', () => {
    it('should return feature level based on spartacus current version', async () => {
      const version = getSpartacusSchematicsVersion();
      const featureLevel = getSpartacusCurrentFeatureLevel();
      expect(featureLevel).toBeTruthy();
      expect(featureLevel.length).toEqual(3);
      expect(featureLevel).toEqual(version.substring(0, 3));
    });
  });
});
