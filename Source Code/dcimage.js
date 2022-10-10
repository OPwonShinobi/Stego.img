'use strict';
var isDecodeMode = false;

function handleToggleMode() {
	isDecodeMode = !isDecodeMode;
	document.getElementById("toggleBtn").style.background = !isDecodeMode ? "lightgrey" : "white";
	document.getElementById("encodeForm").style.display = !isDecodeMode ? "block" : "none";
	document.getElementById("decodeForm").style.display = isDecodeMode ? "block" : "none";
}

function handleEncodeRequest(event) {
	event.preventDefault();
	const coverImg = document.getElementById("cover_img");
	const embeddedImg = document.getElementById("embedded_img");
	if (!coverImg.src || !embeddedImg.src) {
		document.getElementById("encodeForm").reset();
		return false;
	}
	if (embeddedImg.title.length > 99) {
		alert("Embedded filename too long! Max 99 allowed");
		return false;
	}
	const passwordField = document.getElementById("enc_password");
	const payload = simpleEncrypt(embeddedImg.src, passwordField.value);
	const extension = coverImg.title.split('.').pop();
	try {
		const encodedByteArray = encode(imageToByteArray(coverImg), embeddedImg.title, payload);
		const encodedImgUrl = byteArrayToImageUrl(encodedByteArray, coverImg.width, coverImg.height, extension);
		document.getElementById("output_img_thumbnail").src = encodedImgUrl;
		const downloadLink = document.getElementById("output_img_hyperlink");
		downloadLink.download = "encoded_" + coverImg.title;
		downloadLink.href = encodedImgUrl;
	} catch (encodeError) { 
		alert(encodeError);
	}
	return false;
}

function handleDecodeRequest(event) {
	event.preventDefault();
	const stegoImg = document.getElementById("stego_img");
	if (!stegoImg.src) {
		document.getElementById("decodeForm").reset();
		return false;
	}
	const passwordField = document.getElementById("dec_password");
	try {
		const fileData = decode(imageToByteArray(stegoImg));
		const payload = simpleEncrypt(fileData.data, passwordField.value);
		try {
			new URL(payload);
		} catch (error) {
			throw "Decryption failed, bad password!"
		}
		document.getElementById("output_img_thumbnail").src = payload;
		const downloadLink = document.getElementById("output_img_hyperlink");
		downloadLink.download = fileData.name;
		downloadLink.href= payload;
	} catch (decodeError) { 
		alert(decodeError);
	}
	return false;
}

function handleImageChanged(event) {
	const imgElem = document.getElementById(event.target.name)
	const imgElemThumbnail = document.getElementById(event.target.name + "_thumbnail")
	const file = event.target.files[0];
	function setImgSrc(url) {
		imgElem.src = url;
		imgElemThumbnail.src = url;
		imgElem.title = url ? file.name : "";
		imgElem.size = url ? file.size : 0;
		document.getElementById("output_img_thumbnail").src = "";
		document.getElementById("output_img_hyperlink").removeAttribute("href"); 
	}
	fileToURL(file, setImgSrc);
}

function fileToURL(file, callback) {
    const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = function() {
		callback(reader.result);
    }; 
    reader.onerror = function() {
    	console.err(reader.error);
		callback(null);
    }; 
}

function imageToByteArray(imgElem) {
	const tempCanvas = document.createElement('canvas')
	tempCanvas.width = imgElem.width;
	tempCanvas.height = imgElem.height;
	const tempCtx = tempCanvas.getContext('2d');
	tempCtx.drawImage(imgElem, 0, 0);

	const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
	return imgData.data;
}
function byteArrayToImageUrl(byteArray, imgWidth, imgHeight, format) {
	const tempCanvas = document.createElement('canvas')
	tempCanvas.width = imgWidth;
	tempCanvas.height = imgHeight;
	const tempCtx = tempCanvas.getContext('2d');
	const imageData = new ImageData(byteArray, imgWidth, imgHeight);
	tempCtx.putImageData(imageData, 0, 0);
	format = format == "jpg" ? "png" : format;
	return tempCanvas.toDataURL("image/" + format);
}