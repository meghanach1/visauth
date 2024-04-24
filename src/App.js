import { Amplify } from 'aws-amplify';
import './App.css';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { signOut } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import config from './amplifyconfiguration.json';
import { useState } from 'react';
import background from './visitors/main.png'; // Import the background image
import awsLogo from './visitors/aws.png'; 
Amplify.configure(config);
const uuid = require('uuid');

function App() {
  const [image, setImage] = useState(''); 
  const [imgName, setImgName] = useState('placeholder.jpeg');
  const [uploadResultMessage, setUploadResultMessage] = useState('Please upload an image to authenticate visitor.');
  const [isAuth, setAuth] = useState(false);

  function sendImage(e){
    e.preventDefault();
    setImgName(image.name);
    const visitorImageName = uuid.v4();
    console.log(visitorImageName);
    fetch(`https://y925nsp3ja.execute-api.us-east-1.amazonaws.com/dev/project-visitorsbucket/${visitorImageName}.jpeg`,{
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg',
        'Accept':'image/jpeg'
      },
      body: image
    }).then(async () => {
      const response = await authenticate(visitorImageName);
      console.log(image.name)
      console.log(response)
      if(response.Message === 'Success'){
        setAuth(true);
        setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, Welcome to Amazon DataCenter!! Hope you have a wonderful visit.` )
      } else {
        setAuth(false);
        setUploadResultMessage(`Visitor is not registered!! Please contact Admin services to register!!`)
      }
    }).catch(error => {
      setAuth(false);
      setUploadResultMessage('There is Authentication error.please try again')
      console.error(error);
    })
  }
  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.log('error signing out: ', error);
    }
  }
  async function authenticate(visitorImageName){
    const requestUrl = `https://y925nsp3ja.execute-api.us-east-1.amazonaws.com/dev/admin?` + new URLSearchParams({
      objectKey : `${visitorImageName}.jpeg`
    });
    console.log(requestUrl);
    return await fetch(requestUrl, {
      method: 'GET',
      headers:{
        'Accept' :'application/json',
        'Content-Type' : 'application/json'
      }
    }).then(response => response.json())
    .then((data) => {
      return data;
    }).catch(error => console.error(error));
  }

  return (
    <div className="App" >
      <div className="Header" >
        <img src={awsLogo} alt="AWS Logo" className="aws-logo" />
      <h2 align='center' >VISITOR AUTHENTICATION FOR AMAZON DATA CENTER</h2>
      </div>
      <div className="form-container">
      <form onSubmit={sendImage} className="form"> 
        <input type='file' name='image' onChange={e => setImage(e.target.files[0])} className="form-input" />
        <button type='submit' className="button">Authenticate Visitors</button>
      </form>
      <div className={isAuth ? 'success' : 'failure'}>{uploadResultMessage}</div>
      <img src={require(`./visitors/${imgName}`)} alt= "Visitor" height={250} width={250}></img>
    </div>
    <footer className="footer">
      <p>Contact Admin services: <a href="mailto:meghana.chodagiri986@gmail.com">meghana.chodagiri986@gmail.com</a></p>
    </footer>
    </div>
  );
}

export default withAuthenticator(App);
