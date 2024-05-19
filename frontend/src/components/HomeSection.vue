<template>
  <div class="upload-container">
    <a href="javascript:void(0)" class="btn-flip" data-back="A Pando Task" data-front="ExcelFile Uploader"></a>
    <div class="header-btn-section">
      <div class="upload-file-container-left">
        <div class="file-upload">
          <label for="upload" class="file-upload-label">
            <span class="file-btns choose">Choose File</span>
            <span class="file-upload-text">No file chosen</span>
            <input type="file" id="upload" class="file-upload-input" :accept="AttachmentConstants.excelMimes" @change="handleFile">
          </label>
        </div>
        <span><button class="file-btns" @click="handleUpload">Upload</button></span>
      </div>
      <div class="upload-file-container-right">
        <button class="file-btns" @click="handleFileExport">Download</button>
        <button class="file-btns" @click="handleReferesh">Refresh</button>
      </div>
    </div>
    <div v-if="message" :class="['floating-message', { 'error-message': isError }]">
      {{ message }}
    </div>
    <div>
        <table>
            <thead class="table-header">
                <tr>
                    <th>Shipment Type*</th>
                    <th>Order Number*</th>
                    <th>Order Type (STO/PO/SO/RO)*</th>
                    <th>Primary Mode*</th>
                    <th>Expected Delivery Date*</th>
                    <th>Incoterm*</th>
                    <th>Source Reference ID*</th>
                    <th>Destination Reference ID*</th>
                    <th>Cargo Type*</th>
                    <th>Material Code*</th>
                    <th>Quantity*</th>
                    <th>Quantity Unit*</th>
                    <th>Shipment Number</th>
                </tr>
            </thead>
            <tbody v-if="shipmentData">
                <tr class="table-line-row" v-for="(data) in shipmentData" :key="data._id">
                    <td>{{ data.shipmentType }}</td>
                    <td>{{ data.orderNumber }}</td>
                    <td>{{ data.orderType }}</td>
                    <td>{{ data.primaryMode }}</td>
                    <td>{{ data.expectedDeliveryDate.split("T")[0] }}</td>
                    <td>{{ data.incoterm }}</td>
                    <td>{{ data.sourceLocation._id }}</td>
                    <td>{{ data.destinationLocation._id }}</td>
                    <td>{{ data.cargoType }}</td>
                    <td>{{ data.materialCode }}</td>
                    <td>{{ data.quantity }}</td>
                    <td>{{ data.quantityUnit }}</td>
                    <td>{{ data.shipmentNumber }}</td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>

<script>
import { AttachmentConstants } from '../constants/uploadConstants'
import actions from '@/store/modules/shipments/actions';
import '../styles/HomeSection.css'


export default {
  name: 'HomeSection',
  props: {
    msg: String
  },
  data() {
    return {
      file: null,
      AttachmentConstants,
      shipmentData: null,
      message: '',
      isError: false
    }
  },
  methods: {
    handleFile(event) {
      this.file = event.target.files[0];
      const fileName = event.target.files[0].name;
      const uploadText = document.querySelector('.file-upload-text');
      uploadText.innerHTML = fileName;
    },
    async handleUpload() {
      const formData = new FormData();
      formData.append('file', this.file);
      try {
        const result = await actions.uploadExcelFile(formData);
        if (result && !result.error) {
          this.handleReferesh();
          this.showMessage('File uploaded successfully!', false);
        }
      } catch (error) {
        console.log(error);
        this.showMessage('Failed to upload file.', true);
      }
    },
    async handleReferesh() {
      try {
        const result = await actions.getExcelFile();
        if (result && !result.error) {
          this.shipmentData = result.data.data;
        }
      } catch (error) {
        console.log(error);
        this.showMessage('Failed to refresh data.', true);
      }
    },
    async handleFileExport() {
      try {
        const result = await actions.exportExcelFile();
        if (result && !result.error) {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'shipment-list.xlsx');
          document.body.appendChild(link);
          link.click();
          this.showMessage('File downloaded successfully!', false);
        }
      } catch (error) {
        console.log(error);
        this.showMessage('Failed to download file.', true);
      }
    },
    showMessage(msg, isError) {
      this.message = msg;
      this.isError = isError;
      setTimeout(() => {
        this.message = '';
      }, 5000);
    }
  },
  mounted() {
    this.handleReferesh()
  }
}
</script>
