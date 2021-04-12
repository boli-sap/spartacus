import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { ImportExportConfig } from '../config/import-export-config';
import { FileValidity, InvalidFileInfo } from '../model';

@Injectable({
  providedIn: 'root',
})
export class ImportExportService {
  constructor(protected importExportConfig: ImportExportConfig) {}

  /**
   * Extracts CSV file and process into a JSON data
   *
   * @param selectedFile CSV file to extract the data
   * @param checkValidityEnabled optional flag to disable the validity check
   * @param validityConfig optional object to pass any custom validity config
   * @returns processed data from CSV or error data in CSV extraction
   */
  csvToData(
    selectedFile: FileList,
    checkValidityEnabled?: Boolean,
    validityConfig?: FileValidity
  ): Observable<unknown> {
    const file: File = selectedFile.item(0) as File;
    return new Observable((observer: Observer<unknown>) => {
      const fileReader: FileReader = new FileReader();
      const checkValidity = this.checkValidity(file, validityConfig);
      if (
        !checkValidityEnabled ||
        (checkValidityEnabled && checkValidity.isFileValid)
      ) {
        fileReader.readAsText(file);
        fileReader.onload = () => {
          observer.next(this.processCsvData(fileReader.result as string));
          observer.complete();
        };
        fileReader.onerror = () => {
          fileReader.abort();
          observer.error(new DOMException('Could not parse the file'));
        };
      } else {
        observer.error(checkValidity.invalidFileInfo);
      }
    });
  }

  /**
   * Combines passed validity config with default
   *
   * @param validityConfig optional validity config if passed from parent component
   * @returns default validity config overridden by passed validity configs
   */
  protected setValidityConfig(
    validityConfig: FileValidity | undefined
  ): FileValidity {
    return {
      ...this.importExportConfig.importExport.fileValidity,
      ...validityConfig,
    };
  }

  /**
   * Checks validity of the file
   *
   * @param file CSV file to check
   * @param validityConfig optional object to pass any custom validity config
   * @returns validity boolean and invalid file information object if any
   */
  protected checkValidity(
    file: File,
    validityConfig?: FileValidity
  ): { isFileValid: Boolean; invalidFileInfo: InvalidFileInfo } {
    let isFileValid: Boolean = true;
    const invalidFileInfo: InvalidFileInfo = {};
    validityConfig = this.setValidityConfig(validityConfig);
    if (
      validityConfig?.maxSize &&
      file.size / 1000000 > validityConfig?.maxSize
    ) {
      isFileValid = false;
      invalidFileInfo.fileTooLarge = true;
    }
    if (!validityConfig?.allowedExtensions?.includes(file.type)) {
      isFileValid = false;
      invalidFileInfo.invalidExtension = true;
    }
    if (validityConfig?.checkEmptyFile && file.size === 0) {
      isFileValid = false;
      invalidFileInfo.fileEmpty = true;
    }
    return { isFileValid, invalidFileInfo };
  }

  private get separator() {
    return this.importExportConfig.importExport.file.separator;
  }
  /**
   * Processes the CSV data and coverts into JSON
   *
   * @param data raw extracted data from CSV
   * @returns JSON object containing productCode and quantity of products
   */
  protected processCsvData(data: string): ProductsData {
    const csvData: ProductsData = [];
    const dataArray = data.replace(/"/g, '').split('\n');
    dataArray.forEach((data) => {
      const row = { productCode: '', quantity: 0 };
      const rowData = data.split(',');
      if (rowData[0] && rowData[0] !== 'Sku') {
        row['productCode'] = rowData[0];
        row['quantity'] = Number(rowData[1]);
        csvData.push(row);
      }
    });
    return csvData;
  }

  /**
   * Converts array of objects into CSV data structure.
   *
   * @param objectsArray Array of objects which should be converted to CSV.
   */
  dataToCsv<T extends { [key: string]: unknown }>(objectsArray: T[]): string {
    const array =
      typeof objectsArray != 'object' ? JSON.parse(objectsArray) : objectsArray;

    return array.reduce((str: string, row: T) => {
      const line = Object.keys(row).reduce(
        (currentLine, cell) =>
          `${currentLine}${currentLine !== '' ? this.separator : ''}"${
            row[cell]
          }"`,
        ''
      );
      return `${str}${line}\r\n`;
    }, '');
  }
}
