function encode(carrierByteArray, embeddedFileName, payload) {
	const payload_size = (4 + 2 + embeddedFileName.length + 2 + payload.length.toString().length + payload.length) * 8;
	const carrier_size = (carrierByteArray.length * 0.75) >> 0;
	console.log("payload_size", payload_size, "carrier_size", carrier_size)
	if (carrier_size < payload_size) {
		throw "Carrier image too small!"
	}
	let ci = 0;
	ci = encodeBytesWithMsg(carrierByteArray, ci, "STEG");
	ci = encodeBytesWithMsg(carrierByteArray, ci, embeddedFileName.length.toString().padEnd(2, ' '));
	ci = encodeBytesWithMsg(carrierByteArray, ci, embeddedFileName);
	ci = encodeBytesWithMsg(carrierByteArray, ci, payload.length.toString().length.toString().padEnd(2, ' '));
	ci = encodeBytesWithMsg(carrierByteArray, ci, payload.length.toString());
	ci = encodeBytesWithMsg(carrierByteArray, ci, payload);
	return carrierByteArray;
}

/*
known issue with alpha channel
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData#data_loss_due_to_browser_optimization
https://www.reddit.com/r/javascript/comments/2ti79o/canvas_putimagedata_and_getimagedata_alter_data/
*/
function encodeBytesWithMsg(bytes, index, msg) {
	for (let i = 0; i < msg.length; i++) {
		const b = typeof msg == "string" ? msg.charCodeAt(i) : msg[i];
		for (let j = 0; j < 8; ) {
			if ((index+1) % 4 == 0) {
				//alpha channel, hardcode to max val
				bytes[index] = 255;
			} else {
				const msgbit = ((255 & (b << j)) >>> 7);
				const targetByte = ((bytes[index] >>> 1) << 1);
				bytes[index] = targetByte + msgbit;
				j++
			}
			index++;
		}
	}
	return index;
}
function decodeStrFromBytes(bytes, data, readLength) {
	data.value = "";
	for (let i = 0; i < readLength; i++) {
		const bits = [];
		for (let j = 0; j < 8; ) {
			if ((data.index+1) % 4 != 0) {
				const msgbit = 1 & bytes[data.index];
				bits.push(msgbit);
				j++
			} //else alpha channel, no data here, move onto next byte 
			data.index++;
		}
		let byte=0;
		for (let k = 0; k < 8; k++) {
			byte += (bits[k] << 7-k);
		}
		data.value += String.fromCharCode(byte);
	}
}
// unused, added for testing
function decodeBytesFromBytes(bytes, data, readLength) {
	data.value = new Uint8ClampedArray(readLength);
	for (let i = 0; i < readLength; i++) {
		const bits = [];
		for (let j = 0; j < 8; ) {
			if ((data.index+1) % 4 != 0) {
				const msgbit = 1 & bytes[data.index];
				bits.push(msgbit);
				j++
			} //else alpha channel, no data here, move onto next byte 
			data.index++;
		}
		let byte=0;
		for (let k = 0; k < 8; k++) {
			byte += (bits[k] << 7-k);
		}
		data.value[i] = byte;
	}
}

function decode(stegoByteArray) {
	// check if first bytes is watermark
	let data = {index: 0, value: null};
	decodeStrFromBytes(stegoByteArray, data, 4);
	if (data.value != "STEG") {
		throw "No file encrypted here";
	}
	decodeStrFromBytes(stegoByteArray, data, 2);
	const embeddedFileNameLen = parseInt(data.value.trim());
	decodeStrFromBytes(stegoByteArray, data, embeddedFileNameLen);
	const embeddedFileName = data.value;
	decodeStrFromBytes(stegoByteArray, data, 2);
	const embeddedFileSizeLen = parseInt(data.value.trim());
	decodeStrFromBytes(stegoByteArray, data, embeddedFileSizeLen);
	const embeddedFileSize = parseInt(data.value);
	decodeStrFromBytes(stegoByteArray, data, embeddedFileSize);
	return {name: embeddedFileName, data: data.value};
}

function simpleEncrypt(msg, password) {
	if (!password)
		return;
	let sum = 0;
	for (let i = password.length - 1; i >= 0; i--) {
		sum += password.charCodeAt(i);
	}
	let offset = (sum / password.length) >> 0;
	let result = ""; 
	for (let i = msg.length - 1; i >= 0; i--) {
		result += String.fromCharCode(msg.charCodeAt(i) ^ offset);
	}
	return result;
}

function help() {
	const msg = 
`Simple Stego TOOL

A JS steganography tool that helps people hide password-encrypted images in other images!

Fill in the required fields on the page, and press the appropriate button for your use case. Use the toggle button to switch between encode and decode mode. Currently, only .bmp/.jpg/.png are supported.

--Encode mode--
A password-encrypted version of "Embedded Image" will be encoded into "Plain Image".

--Decode mode--
An image will be extracted from "Stego image" if any exists, and decrypted using the password.   

Once complete, a preview and download link of your output image will appear. 
	`
	alert(msg);
}