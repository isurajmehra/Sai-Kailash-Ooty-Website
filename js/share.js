var editor;
var maintitleFilled = false;
var authorFilled = false;
var detail = false;
var userUID;
var emailID;
var imageUpload = true;

var firebaseDataSetSucceed = false;
var firebaseImageSetSucceed = false;
var firebaseStorageSetSucceed = false;

function initialize() {
    var container = document.getElementById('writeup');
    editor = new Quill(container, {
        theme: 'snow'
    });

}

function setEmail(email) {
    emailID = email;
}

function setUserID(userid) {
    userUID = userid;
}

function enableSubmitButton() {
    var maintitleId = document.getElementById('maintitle');
    var authorId = document.getElementById('author');

    maintitleId.oninput =
        function () {
            if ($(this).val().length > 0) {
                maintitleFilled = true;
                checkSubmitEnable();
            } else {
                maintitleFilled = false;
                checkSubmitEnable();
            }
        };
    maintitleId.onpropertychange = maintitleId.oninput;

    authorId.oninput = function () {
        if ($(this).val().length > 0) {
            authorFilled = true;
            checkSubmitEnable();
        } else {
            authorFilled = false;
            checkSubmitEnable();
        }
    };
    authorId.onpropertychange = maintitleId.oninput;

    editor.on('text-change', function () {
        detail = editor.getText().trim().length > 0;
        checkSubmitEnable();
    });

    $('#uploadFile').change(function () {
        var fileName = $(this).val();
        var imageDetails = document.getElementById("imageDetails");
        if (fileName.length > 0) {
            var imageNameWarning = document.getElementById("imageNameWarning");
            var uploadFileName = document.getElementById("uploadFileName");
            imageDetails.style.display = 'inline';
            imageNameWarning.style.display = 'inline';
            imageUpload = false;
            checkSubmitEnable();

            uploadFileName.oninput = function () {
                if ($(this).val().length > 0) {
                    imageUpload = true;
                    imageNameWarning.style.display = 'none';
                    checkSubmitEnable();
                } else {
                    imageUpload = false;
                    imageNameWarning.style.display = 'inline';
                    checkSubmitEnable();
                }
            };
            uploadFileName.onpropertychange = uploadFileName.oninput;

        } else {
            imageDetails.style.display = 'none';
            imageUpload = true;
            checkSubmitEnable();
        }

    });
}

function checkSubmitEnable() {
    if (maintitleFilled && authorFilled && detail && imageUpload) {
        $('.button').prop("disabled", false);
    } else {
        $('.button').prop("disabled", true);
    }
}

function submit() {
    function showFailureNotice() {
        var failureNotice = document.getElementById("failureNotice");
        failureNotice.style.display = 'inline';
    }

    var maintitleValue = document.getElementById('maintitle').value;
    var authorValue = document.getElementById('author').value;
    var phoneValue = document.getElementById('phone').value;
    var detail = editor.root.innerHTML;
    var imageDetails = document.getElementById("imageDetails");

    firebase.database().ref("experience/user").child(userUID).set({
        title: maintitleValue,
        author: authorValue,
        phone: phoneValue,
        content: detail,
        email: emailID
    }).then(function () {
        firebaseDataSetSucceed = true;
        checkSucceed();
    })
        .catch(function (error) {
            showFailureNotice()
        });

    if (imageDetails.style.display != "none") {
        var uploadFileName = document.getElementById("uploadFileName").value;
        var imagedescription = document.getElementById("imagedescription").value;
        firebase.database().ref("experience/user/" + userUID + "/image/" + uploadFileName).update({
            title: uploadFileName,
            description: imagedescription
        }).then(function () {
            firebaseImageSetSucceed = true;
            checkSucceed();
        })
            .catch(function (error) {
                showFailureNotice();
            });

        var storageRef = firebase.storage().ref('experience/user/' + userUID + "/image/" + uploadFileName);
        var $ = jQuery;
        var file = $('#uploadFile').prop('files')[0];

        storageRef.put(file).then(function (snapshot) {
            // console.log('Uploaded a blob or file!');
        }).then(function () {
            firebaseStorageSetSucceed = true;
            checkSucceed();
        })
            .catch(function (error) {
                showFailureNotice();
            });

    }
}

function checkSucceed() {
    if (firebaseStorageSetSucceed && firebaseImageSetSucceed && firebaseDataSetSucceed) {
        console.log("success")
    }
}