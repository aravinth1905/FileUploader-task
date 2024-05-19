import axiosInstance from '../../../utils/axiosInstances';
const actions = {

    async uploadExcelFile(formData) {
        try {
            console.log('hii')
          const result = await axiosInstance.post(`/upload_excel`, formData,{
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return result;
        } catch (err) {
          return err;
        }
      },
      async getExcelFile() {
        try {
          const result = await axiosInstance.get(`/upload_excel`);
          return result;
        } catch (err) {
          return err;
        }
      },
      async exportExcelFile() {
        try {
          const result = await axiosInstance.get(`/export`,{responseType: 'blob'});
 
          if (result.data.size) {
            const url = window.URL.createObjectURL(new Blob([result.data]));
            const link = document.createElement('a');
            link.href = url;
            const now = new Date().toISOString();
            const fileName = 'shipment';
            link.setAttribute('download', `${fileName}-export-${now}.xlsx`); // or any other extension
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          return true;
          
        } catch (err) {
          console.log('error', err);
          return err;
        }
      }
}
export default actions;