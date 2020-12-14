pragma solidity 0.5.0;

contract DecentraTube {
  string public name = "DecentraTube";
  
  //store Images create id=> struct mapping
   uint public videoCount = 0;
   mapping(uint => Video) public videos;      // they key is a uint and the value is the actual Image struct which has an IPFS hash

  //create struct
  struct Video {
     uint id;
     string hash;
     string title;
     address payable author;
   }
   //create event
   event VideoUploaded(
     uint id,
     string hash,
     string title,
     address payable author
   );
  constructor() public {

  }
  function uploadVideo(string memory _videoHash, string memory _title) public {
    //make sure the video hash exists
    require(bytes(_title).length>0);      
    
    //make sure video title exists
    require(bytes(_videoHash).length>0);

    //make sure uploader address exists
    require(msg.sender != address(0));

    //increment video id
    videoCount++;

    //add video to the contract
    videos[videoCount]= Video(videoCount, _videoHash, _title, msg.sender);

    //trigger an event
    emit VideoUploaded(videoCount, _videoHash, _title, msg.sender);
  }
}