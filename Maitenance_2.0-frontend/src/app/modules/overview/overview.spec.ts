// import { Component, ElementRef, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';

// // @Component({
// //   selector: 'app-scanner',
// //   standalone: true,
// //   imports: [CommonModule],
// //   // templateUrl: './scanner.html',
// //   // styleUrls: ['./scanner.scss']
// // })
// export class ScannerComponent {

//   @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

//   scannedData: string = '';
//   stream: MediaStream | null = null;

//   async startScanner() {
//     try {
//       this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       this.video.nativeElement.srcObject = this.stream;
//     } catch (err) {
//       console.error('Camera error:', err);
//     }
//   }

//   stopScanner() {
//     this.stream?.getTracks().forEach(track => track.stop());
//   }
// }