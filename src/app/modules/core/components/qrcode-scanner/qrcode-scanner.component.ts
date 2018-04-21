import { FIREBASE_CONFIG } from './../../../../firebase.config';
import { Component, VERSION, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { Result } from '@zxing/library';
import * as moment from 'moment';
import * as cryptico from 'cryptico';

@Component({
    selector: 'app-qrcode-scanner',
    templateUrl: './qrcode-scanner.component.html',
    styleUrls: ['./qrcode-scanner.component.sass']
})

export class QRCodeComponent implements OnInit {

    @ViewChild('scanner')
    scanner: ZXingScannerComponent;

    @Output()
    result = new EventEmitter<any>();

    availableDevices: MediaDeviceInfo[];
    bits = 1024; // Size of the rsa key
    hasCameras = false;
    key = FIREBASE_CONFIG.apiKey; // The key available to all devices, to encypt or decrypt data
    ngVersion = VERSION.full;
    qrResultString: string;
    qrResult: Result;
    rsaKey: any;
    rsaPublicKey: any;
    scannerEnabled = true;
    selectedDevice: MediaDeviceInfo;
    scan = false;
    response: IResponse;

    constructor() {
        this.rsaKey = cryptico.generateRSAKey(this.key, this.bits);
        this.rsaPublicKey = cryptico.publicKeyString(this.rsaKey);
    }

    ngOnInit(): void {

        this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
            this.hasCameras = true;
        });

        this.scanner.scanComplete.subscribe((result: Result) => {
            this.qrResult = result;
        });
    }

    // Gets the list of available cameras to be used to scan
    displayCameras(cameras: MediaDeviceInfo[]): void {
        this.availableDevices = cameras;
    }

    // Decrypts the expected encrypted data, ie decrypts the data but returns null if the data is invalid
    decrypt(encrypted: string): any {
        const decrypted = cryptico.decrypt(encrypted, this.rsaKey);
        return decrypted.plaintext || null;
    }

    // Encrypts a given plaintext and returns the encrypted string
    encrypt(plaintxt: string): any {
        const encrypted = cryptico.encrypt(plaintxt, this.rsaPublicKey);
        return encrypted;
    }

    handleScanError(error: any): void {
        console.log(error);
        this.response = { message: 'Error scanning code. Please try again.', type: 'error' };
    }

    handleQrCodeResult(resultString: string): void {
        this.qrResultString = resultString;
        const decryptedString = this.decrypt(resultString);
        this.processData(decryptedString);
    }

    onDeviceSelectChange(selectedValue: string): void {
        this.selectedDevice = this.scanner.getDeviceById(selectedValue);
    }

    // Processes the decrypted data to get the user's account hash if the data was retrieved in a certain interval
    processData(plaintext: any): void {
        console.log(plaintext);
        if (plaintext === null) {
            console.log('QRCode invalid');
            this.response = { message: 'QRCode invalid', type: 'error' };
            this.result.emit({ account: 'invalid', status: this.response.message });
            return;
        }
        const json: IQRCodeData = JSON.parse(plaintext);
        const startTime = moment(new Date(json.timestamp)).format('YYYY-MM-DD HH:mm:ss'); // Get the time listed on the qrcode
        const currentTime = moment(new Date().toISOString()).format('YYYY-MM-DD HH:mm:ss'); // Get the current time

        const duration = moment.duration(moment(currentTime).diff(startTime));
        const seconds = duration.asSeconds();

        // Additional 10s was added to adjust for any delays in processing the data
        if (seconds <= parseInt(json.interval, 10) + 10) {
            this.response = { message: 'Scan successful', type: 'success' };
            this.result.emit({ account: json.data, status: this.response.message });
            console.log(json.data);
        } else {
            console.log('Time interval too large');
            this.response = { message: `Please scan again. QRCode is older than ${json.interval}s`, type: 'error' };
            this.result.emit({ account: 'invalid', status: this.response.message });
        }
    }

    cancel() {
        this.result.emit({ account: 'invalid', status: 'Scan canceled' });
    }

    toggleScan(): void {
        this.scan = this.scan ? false : true;
    }
}

export interface IQRCodeData {
    timestamp: string;
    interval: string;
    data: string;
}

export interface IResponse {
    message: string;
    type: string;
}
