$(document).ready(function () {

    const imgServer = 'http://localhost:3005/images/';
    const apiServer = 'http://localhost:3005/api/';

    let catMemes = [];
    let currentMeme = undefined;
    getCatMemes();
    getCurrentMeme();


    $('#updateCurrentMeme').click(() => {
        const body = { 
            filename: imgServer + currentMeme.filename + getFileExtension(currentMeme.mimetype),
            mimetype: currentMeme.mimetype,
            toptext: $('#memeTopText').val(),
            bottomtext: $('#memeBottomText').val()
        };
        $.ajax({
            url: apiServer + 'creatememe/',
            type: 'POST',
            processData: false,
            contentType: 'application/json',
            data: JSON.stringify(body),
            success: (res) => {
                console.log('Success!');
                const url = 'data:' + currentMeme.mimetype + ';base64,' + res;
                $('#currentMeme').attr('src', url);
                window.URL.revokeObjectURL(url);
            },
            error: (err) => {
                console.log(err);
                alert('Error: In sending the request!');
            }
        });
    });

    $('#saveCurrentMeme').click(() => {
        $.ajax({
            url: apiServer + 'savecurrent/',
            type: 'POST',
            contentType: false,
            processData: false,
            cache: false,
            data: '',
            success: (res) => {
                getCatMemes();
                getCurrentMeme();
                $('#v-pills-view-tab').click();
                console.log('Success!', res);
            },
            error: () => {
                alert('Error: In sending the request!');
            }
        });
    });

    $("#formUpload").submit((event) => {
        event.preventDefault();
        const data = new FormData($('#formUpload')[0]);

        let spinner = '<div class="spinner-border text-primary" role="status">' 
        spinner += '<span class="visually-hidden">Loading...</span></div>';
        $('#uploadButton').html(spinner);

        let submitButton = '<button id="submitMeme" type="submit" class="btn btn-primary mb-3">Upload Cat Picture</button>';
        
        $.ajax({
            url: apiServer + 'upload/',
            type: 'POST',
            contentType: false,
            processData: false,
            cache: false,
            data: data,
            success: (res) => {
                getCurrentMeme();
                console.log('Success!', res);
                setTimeout(() => {
                    $('#uploadButton').html(submitButton);
                    $('#v-pills-create-tab').click();
                }, 2000);
            },
            error: () => {
                alert('Error: In sending the request!');
                $('#uploadButton').html(submitButton);
            }
        });
    });


    function getCatMemes() {
        $.getJSON(apiServer + 'memes/', (memes) => {
            catMemes = memes;
            let catCarousel = '';
            let catGrid = '';
            let isFirst = true;
            if (catMemes.length === 0) {
                catCarousel = '<h3>No Cat Memes Available</h3>'
            } else {
                catMemes.forEach((m) => {
                    const img = m.filename + getFileExtension(m.mimetype);
                    if (isFirst) {
                        catCarousel = '<div class="carousel-item active">';
                        isFirst = false;
                    } else {
                        catCarousel += '<div class="carousel-item">';    
                    }
                    catCarousel += '<img class="meme-image" src="' + imgServer + img;
                    catCarousel += '" class="d-block w-150" alt="' + img + '"></div>';       
                    
                    const buttonId = 'button' + m.filename;
                    catGrid += '<div class="col"><img class="grid-image" src="' + imgServer + img + '">';
                    catGrid += '<button id="' + buttonId + '" type="button" class="btn btn-outline-danger" ';
                    catGrid += '" value="' + m.filename + '">Delete</button></div>';
                    $('#memeGrid').on('click', '#' + buttonId, (meme) => {
                        deleteMeme(meme.currentTarget.value);
                    });
                });
            }
            $('#catMemeCarousel').html(catCarousel);
            $('#memeGrid').html(catGrid);
        });
    }


    function getCurrentMeme() {
        $('#displayCurrentPic').css('display', 'none');
        $('#noCurrentPic').css('display', 'inline');
        $.getJSON(apiServer + 'currentmeme/', (meme) => {
            if (!meme || !meme.mimetype) {
                currentMeme = undefined;
                $('#currentMeme').html('<h1>No Current Meme</h1>');
            } else {
                currentMeme = meme;
                 $('#currentMeme').attr('src', imgServer + meme.filename + getFileExtension(currentMeme.mimetype));
                 $('#displayCurrentPic').css('display', 'inline');
                 $('#noCurrentPic').css('display', 'none');
            }
        });
    }


    function getFileExtension(mimetype) {
        // Only supports .png and .jpg
        return (mimetype === 'image/png') ? '.png' : '.jpg';
    }

    function deleteMeme(meme) {
        console.log(meme);
        if (confirm('Delete Meme?')) {
            $.ajax({
                url: apiServer + 'deletememe/' + meme,
                type: 'DELETE',
                success: (res) => {
                    console.log('Success!', res);
                    getCatMemes();
                },
                error: () => {
                    alert('Error: Deleting Meme!');
                }
            });
        }
    }

});
