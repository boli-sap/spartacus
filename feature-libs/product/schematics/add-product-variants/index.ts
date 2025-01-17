import { Rule } from '@angular-devkit/schematics';
import {
  addLibraryFeature,
  LibraryOptions as SpartacusVariantsOptions,
  SPARTACUS_PRODUCT,
} from '@spartacus/schematics';
import {
  PRODUCT_FOLDER_NAME,
  PRODUCT_SCSS_FILE_NAME,
  SPARTACUS_VARIANTS,
  SPARTACUS_VARIANTS_ASSETS,
  SPARTACUS_VARIANTS_ROOT,
  VARIANTS_FEATURE_NAME,
  VARIANTS_MODULE,
  VARIANTS_ROOT_MODULE,
  VARIANTS_TRANSLATIONS,
  VARIANTS_TRANSLATION_CHUNKS_CONFIG,
} from '../constants';

export function addVariantsFeature(options: SpartacusVariantsOptions): Rule {
  return addLibraryFeature(options, {
    folderName: PRODUCT_FOLDER_NAME,
    name: VARIANTS_FEATURE_NAME,
    featureModule: {
      name: VARIANTS_MODULE,
      importPath: SPARTACUS_VARIANTS,
    },
    rootModule: {
      name: VARIANTS_ROOT_MODULE,
      importPath: SPARTACUS_VARIANTS_ROOT,
    },
    i18n: {
      resources: VARIANTS_TRANSLATIONS,
      chunks: VARIANTS_TRANSLATION_CHUNKS_CONFIG,
      importPath: SPARTACUS_VARIANTS_ASSETS,
    },
    styles: {
      scssFileName: PRODUCT_SCSS_FILE_NAME,
      importStyle: SPARTACUS_PRODUCT,
    },
  });
}
