const { assert } = require('chai');

const DecentraTube = artifacts.require('DecentraTube')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('DecentraTube', ([deployer, author]) => {
  let decentraTube

  before(async () => {
    // Load Contracts
    decentraTube = await DecentraTube.new()
  })

  describe('DecentraTube deployment', async () => {
    it('has a name', async () => {
      const name = await decentraTube.name()
      assert.equal(name, 'DecentraTube')
    })
    it('has an address', async () => {
      const address = await decentraTube.address
      assert.notEqual(address, '0x0')
      assert.notEqual(address, '')
      assert.notEqual(address, null)
    })
  })
  describe('videos', async()=>{
    let result, videoCount
    const hash = 'abc123'

    before(async() => {
      result = await decentraTube.uploadVideo(hash, 'video title', {from: author})
      videoCount = await decentraTube.videoCount()
    })
    it('creates videos', async()=> {
      //success
      assert.equal(videoCount,1)
      const event = result.logs[0].args 
      assert.equal(event.id.toNumber(), videoCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'hash is correct')

      //failure: video must have a hash
      await decentraTube.uploadVideo('', 'Video title', {from:author}).should.be.rejected;
      //failure: video must have a video hash
      await decentraTube.uploadVideo(hash, '', {from:author}).should.be.rejected;
    })
  })
})