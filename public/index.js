/*global firebase*/

class App {
 constructor() {
  this.database = firebase.firestore();
  this.storage = firebase.storage();

  this.submit = document.getElementById("submit");
  this.submit.onclick = () => this.submitEquation();

  this.userInput = document.getElementById("userInput");

  this.screenshotCanvas = document.getElementById("screenshotCanvas");

  this.message = document.getElementById("message");

  this.video = document.querySelector('video');

  this.video.onclick = () => this.submitEquationImage();

  navigator.mediaDevices.getUserMedia({
    video: {
     facingMode: "environment"
    }
   }).then(stream => this.video.srcObject = stream)
   .catch(error => {
     this.message.innerHTML = "Error trying to connect to camera...";
     console.error("Error while trying to connect to camera...", error);
    }

   );
 }

 submitEquationImage() {
  this.screenshotCanvas.width = this.video.videoWidth;
  this.screenshotCanvas.height = this.video.videoHeight;
  this.screenshotCanvas.getContext('2d').drawImage(this.video, 0, 0);

  this.message.innerHTML = "Uploading Picture...";

  this.database.collection("equations3").add({
   state: "uploadedData",
   imageData: this.screenshotCanvas.toDataURL()
  }).then(docRef => {
    this.message.innerHTML = "Checking your solution...";
    this.database.collection("equations3").doc(docRef.id)
     .onSnapshot((doc) => {
      console.log(doc.data());
      if (doc.data().message) {
       this.message.innerHTML = doc.data().message;
       this.userInput.value = "";
       let equations = doc.data().equations;
       for (let i = 0; i < equations.length; i++) {
        this.userInput.value += equations[i] + "\n";
       }
      }
     });
   }

  ).catch(error => {
   this.message.innerHTML = "An error has occured :(";
   console.error("Error uploading to Storage", error);
  });
 }

 submitEquation() {
  let equations = this.userInput.value.split("\n");

  this.message.innerHTML = "Loading...";
  this.database.collection("equations").add({
   solution: equations
  }).then((docRef) => {
   this.database.collection("equations").doc(docRef.id)
    .onSnapshot((doc) => {
     console.log(doc.data());
     if (doc.data().correctSolution) {
      this.message.innerHTML = doc.data().correctSolution;
     }
    });
   console.log("Document written with ID: ", docRef.id);
  }).catch((error) => {
   console.error("Error adding document: ", error);
  });
 }
}

window.onload = () => {
 window.app = new App();
};