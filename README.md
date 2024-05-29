# FileUploader-task
This is an Node and Vue.js application for bulk uploading shipment data from an Excel file and show them in the UI.

## Features

- Upload Excel files containing shipment data.
- Process uploaded data and save shipments to the database.
- Refresh shipment data.
- Download a demo Excel file.

## Installation

1. Clone this repository.
2. Install dependencies for both the backend and frontend:
   
   ```
   npm install
   ```

4. Start the backend server on port `3649`:
   ```
   npm start
   ```
5. Start the frontend development server on port `8010`:
   ```
   npm run serve
   ```

Ensure that you have Node.js installed on your system before proceeding with the installation. These commands will set up the backend server on port `3649` and the frontend development server on port `5173`.

## Usage

1. Upload an Excel file containing shipment data.
2. Click "Upload " to initiate the upload process.
3. To download a demo Excel file, click "Download Sample".

## Running Tests

To run the unit tests for this application, follow these steps:

1. Ensure that all dependencies are installed by running:

   ```
   npm install
   ```

2. Execute the following command to run the tests:

   ```
   npm test
   ```

   This command will run the unit tests using Mocha and output the results to the console. You can use the `npm run testWithLogs` to log output if needed.

3. After the tests have finished running, you will see the test results displayed in the console, indicating whether each test passed or failed.

Make sure to resolve any dependencies or configuration issues before running the tests to ensure accurate results.

## Technologies Used

- Vue.js
- Node.js
- Express.js
- MongoDB
