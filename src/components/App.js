import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import DecentraTube from '../abis/DecentraTube.json';
import Navbar from './Navbar';
import Main from './Main';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = DecentraTube.networks[networkId]
    if(networkData) {
      const decentraTube = new web3.eth.Contract(DecentraTube.abi, networkData.address)
      this.setState({ decentraTube })
      //get the videosCount by calling the videoCount() function
      const videosCount = await decentraTube.methods.videoCount().call()
      this.setState({videosCount:videosCount})
      //load the videos and sort them by newest first
      for(var i = videosCount; i>=1; i--) {
        const video = await decentraTube.methods.videos(i).call()
        this.setState({videos:[...this.state.videos, video]})
      }
      //Set the latest video with title to view as default
      const latest =await decentraTube.methods.videos(videosCount).call()
      this.setState({
        currentHash:latest.hash,
        currentTitle: latest.title 
      })
      this.setState({loading:false})
    } else {
      window.alert('decentraTube contract not deployed to detected network.')
    }
    console.log(this.state.account);
   
  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  //Get video
  captureFile=(event)=>{
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()    //capture the file and change it to a buffer
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) }) //set the buffer to state
      console.log('buffer', this.state.buffer)
    }
  }

  //Upload video
  uploadVideo=(title)=>{
    console.log("Submitting file to ipfs...")

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }
      //put video on blockchain
      this.setState({ loading: true })
      this.state.decentraTube.methods.uploadVideo(result[0].hash, title).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }
  //change video
  changeVideo=(hash,title)=>{
    this.setState({'currentHash':hash});
    this.setState({'currentTitle':title});

  }

  constructor(props) {
    super(props)
    this.state={
      account:'',
      decentraTube:null,
      loading: true,
      buffer:null,
      videos:[],
      currentHash:null,
      currentTitle: null
    }
  }
  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              captureFile={this.captureFile}
              uploadVideo={this.uploadVideo}
              currentHash={this.state.currentHash}
              currentTitle={this.state.currentTitle}
              changeVideo={this.changeVideo}
              videos={this.state.videos}
            />
        }
      </div>
    );
  }
}

export default App;