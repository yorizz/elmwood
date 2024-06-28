var sodium = require("sodium-native");

var nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
var key = sodium.sodium_malloc(sodium.crypto_secretbox_KEYBYTES); // secure buffer

function sodiumEncrypt(stringToEncrypt) {
	var message = Buffer.from(stringToEncrypt);
	var ciphertext = Buffer.alloc(
		message.length + sodium.crypto_secretbox_MACBYTES
	);

	sodium.randombytes_buf(nonce); // insert random data into nonce
	sodium.randombytes_buf(key); // insert random data into key

	// encrypted message is stored in ciphertext
	sodium.crypto_secretbox_easy(ciphertext, message, nonce, key);

	console.log("Encrypted message:", ciphertext);
	let plainText = Buffer.alloc(
		ciphertext.length - sodium.crypto_secretbox_MACBYTES
	);
	console.log("buff2str", ciphertext.toString(), plainText);
	return ciphertext;
}

function sodiumDecrypt(encryptedStringBuffer) {
	let rv = false;

	let plainText = Buffer.alloc(
		encryptedStringBuffer.length - sodium.crypto_secretbox_MACBYTES
	);

	if (
		!sodium.crypto_secretbox_open_easy(
			plainText,
			encryptedStringBuffer,
			nonce,
			key
		)
	) {
		console.log("Decryption failed!");
	} else {
		console.log(
			"Decrypted message:",
			plainText,
			"(" + plainText.toString() + ")"
		);
		rv = plainText.toString();
	}
	return rv;
}

let encryptedString = sodiumEncrypt("Let's see if this works");
let decryptedString = sodiumDecrypt(encryptedString);

console.log("Result:", decryptedString);
