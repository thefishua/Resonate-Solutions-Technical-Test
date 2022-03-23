// Problems with this solution
// A cheater can realise that the code is created with base64 and use the same alphabet
// Then they can use the base64 promo code and convert back to base10
// However, this is highly unlikely.

// Solution
// A problem with the specification was the 9 character limit
// If the character limit was larger could use a strong hash function 
// such as AES (even though might be overkill), but will prevent cheaters from 
// creating a duplicate code as they have to be the same as the hash (which is too expensive to create). 
// Also could create a hash function within the 9 character limit but I don't know
// how to code it using a hash map in javascript. 

// Alphabet for base64
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
// Base for decimal to base64 encryption 
const BASE = ALPHABET.length;

/**
 * Function that creates the encryption for the promotion code 
 * The encrypted code is a length lower than 9 characters using a variant of decimal to base64
 * @param {String} code - the storeId, transactionId and date stored in a string
 * @return {String} shortCode - the promotional code for that transaction 
 */
function encrypt(code) {
    var shortCode = "";
    var index;
    while (code) {
        index = code % BASE
        code -= index;
        code /= BASE;
        shortCode = ALPHABET.charAt(index) + shortCode;
    }
    return shortCode;
}

/**
 * Generates the shortCode for the promotion
 * The specification states to make an encryption 
 * Code is no more than 9 characters long 
 * @param {Int} storeId - Id of the store
 * @param {Int} transactionId - Id for the transaction being the customer for that day 
 * @returns {String} the promotional code from the encrypt function
 */
function generateShortCode(storeId, transactionId) {
    // Store Id is 3 digits
    // Transaction Id is 5 digits
    // Date is 8 digits
    var date = new Date();
    storeId = storeId.toString().padStart(3, "0");
    transactionId = transactionId.toString().padStart(5, "0");
    var day = date.getDate().toString().padStart(2, "0");
    var month = date.getMonth().toString().padStart(2, "0");
    var year = date.getFullYear().toString().padStart(4, "0");
    var code = "" + year + month + day + storeId + transactionId;
    return encrypt(code);
} 
/**
 * Function converts base64 code back to base10
 * @param {String} shortCode promotional code 
 * @returns {Int} code which is the decrypted short code
 */
function decrypt(shortCode) {
    var code = 0;
    var index;
    while (shortCode.length) {
        index = ALPHABET.indexOf(shortCode.charAt(0));
        shortCode = shortCode.substr(1);
        code *= BASE;
        code += index;
    }
    return code;
}
/**
 * Function decodes the shortCode and validates the promotional code
 * @param {String} shortCode promotional code
 * @returns {JSON} that includes the storeId, shopDate and transactionId that are compared to real values
 */
function decodeShortCode(shortCode) {
    var code = decrypt(shortCode);
    var year = code.toString().substring(0, 4);
    var month = code.toString().substring(4, 6);
    var day = code.toString().substring(6, 8);
    var storeId = code.toString().substring(8, 11);
    var transactionId = code.toString().substring(11, 16);
    var date = new Date();
    date.setFullYear(year, month, day);
    return {
        storeId: parseInt(storeId), // store id goes here,
        shopDate: date, // the date the customer shopped,
        transactionId: parseInt(transactionId), // transaction id goes here
    };
}

// ------------------------------------------------------------------------------//
// --------------- Don't touch this area, all tests have to pass --------------- //
// ------------------------------------------------------------------------------//
function RunTests() {

    var storeIds = [175, 42, 0, 9]
    var transactionIds = [9675, 23, 123, 7]

    storeIds.forEach(function (storeId) {
        transactionIds.forEach(function (transactionId) {
            var shortCode = generateShortCode(storeId, transactionId);
            var decodeResult = decodeShortCode(shortCode);
            $("#test-results").append("<div>" + storeId + " - " + transactionId + ": " + shortCode + "</div>");
            AddTestResult("Length <= 9", shortCode.length <= 9);
            AddTestResult("Is String", (typeof shortCode === 'string'));
            AddTestResult("Is Today", IsToday(decodeResult.shopDate));
            AddTestResult("StoreId", storeId === decodeResult.storeId);
            AddTestResult("TransId", transactionId === decodeResult.transactionId);
        })
    })
}

function IsToday(inputDate) {
    // Get today's date
    var todaysDate = new Date();
    // call setHours to take the time out of the comparison
    return (inputDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0));
}

function AddTestResult(testName, testResult) {
    var div = $("#test-results").append("<div class='" + (testResult ? "pass" : "fail") + "'><span class='tname'>- " + testName + "</span><span class='tresult'>" + testResult + "</span></div>");
}