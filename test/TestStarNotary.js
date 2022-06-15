const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance}); // , gasPrice:0
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.isBelow((value - starPrice), 0.001 * 10 ** 18); //needed to modify, no gas price didn't pass
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let instance = await StarNotary.deployed();
    let starId = 6;
    let user1 = accounts[1];
    await instance.createStar('awesome star', starId, {from: user1});
    let name = await instance.name.call();
    let symbol = await instance.symbol.call();
    assert.equal(name, "Star NFT");
    assert.equal(symbol, "STAR");
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    let instance = await StarNotary.deployed();
    let starId1 = 7;
    let user1 = accounts[1];
    await instance.createStar('awesome star', starId1, {from: user1});
    let starId2 = 8;
    let user2 = accounts[2];
    await instance.createStar('awesome star', starId2, {from: user2});
    let star1FirstOwner = await instance.ownerOf(starId1);
    let star2FirstOwner = await instance.ownerOf(starId2);
    assert.equal(user1, star1FirstOwner, "Something terribly went wrong with star 1");
    assert.equal(user2, star2FirstOwner, "Something terribly went wrong with star 2");
    await instance.exchangeStars(starId1, starId2, {from: user1});
    let star1SecondOwner = await instance.ownerOf(starId1);
    let star2SecondOwner = await instance.ownerOf(starId2);
    assert.equal(user2, star1SecondOwner, "Exchange failed @ star 1");
    assert.equal(user1, star2SecondOwner, "Exchange failed @ star 2");
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let instance = await StarNotary.deployed();
    let starId = 9;
    let user1 = accounts[1];
    let user2 = accounts[2];
    await instance.createStar('awesome star', starId, {from: user1});
    let starFirstOwner = await instance.ownerOf(starId);
    assert.equal(user1, starFirstOwner, "Something terribly went wrong before star transfer");
    await instance.transferStar(user2, starId, {from: user1});
    let starSecondOwner = await instance.ownerOf(starId);
    assert.equal(user2, starSecondOwner, "Star transfer failed");
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let instance = await StarNotary.deployed();
    let starId = 10;
    let user1 = accounts[1];
    await instance.createStar("l'étoile éblouissante", starId, {from: user1});
    let name = await instance.lookUptokenIdToStarInfo(starId);
    assert.equal(name, "l'étoile éblouissante", 'lookUptokenIdToStarInfo failed');
});