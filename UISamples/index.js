/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2014 Adobe Inc.
* All Rights Reserved.
*
* NOTICE: Adobe permits you to use, modify, and distribute this file in
* accordance with the terms of the Adobe license agreement accompanying
* it. If you have received this file from a source other than Adobe,
* then your use, modification, or distribution of it requires the prior
* written permission of Adobe.
**************************************************************************/
/* Create an instance of CSInterface. */
var csInterface = new CSInterface();
/* Make a reference to your HTML button and add a click handler. */
var openButton = document.querySelector("#open-button");
openButton.addEventListener("click", openDoc);
/* Write a helper function to pass instructions to the ExtendScript side. */
function openDoc() {
    csInterface.evalScript("openDocument()");
}
