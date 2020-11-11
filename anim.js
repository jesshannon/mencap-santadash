
$(function () {

    var teams = [
        {
            name: "Santa's Little Helpers",
            progress: [5, 2, 5, 3, 9, 28, 3],
            position: 0
        },
        {
            name: "Team Christmas",
            progress: [1, 6, 2, 8, 3, 4, 7],
            position: 0
        },
        {
            name: "The Carol Singers",
            progress: [6, 4, 9, 1, 0, 0, 100],
            position: 0
        },
        {
            name: "The Quad Squad",
            progress: [6, 4, 9, 1, 0, 0, 100],
            position: 0
        },
    ];

    $canvas = $('#animcanvas');
    canvas = $canvas[0];
    var ctx = canvas.getContext("2d");

    var snowImages = [
        loadImage('images/Snow01.svg'),
        loadImage('images/Snow02.svg'),
        loadImage('images/Snow05.svg'),
        loadImage('images/Snow04.svg')
    ];

    var reindeerImages = [
        loadImage('images/reindeer01.svg'),
        loadImage('images/reindeer02.svg')
    ];

    var elfImages = [
        loadImage('images/MencapElfBlue.svg'),
        loadImage('images/MencapElfGreen.svg'),
        loadImage('images/MencapElfPink.svg'),
        loadImage('images/MencapElfPurple.svg'),
        loadImage('images/MencapElfDarkGreen.svg'),
        loadImage('images/MencapElfRed.svg')
    ];

    var camera = 0;
    var size = { width: 1920, height: 1080 }
    var rowSpace = Math.min(120, size.height / (teams.length + 1));

    var animCounter = 0;
    var day = 0;

    setTimeout(() => {

        teams = [
            {
                name: "Santa's Little Helpers",
                progress: [5, 2, 5, 3, 9, 28, 3],
                position: 0
            },
            {
                name: "Team Christmas",
                progress: [1, 6, 2, 8, 3, 4, 7],
                position: 0
            },
            {
                name: "The Carol Singers",
                progress: [6, 4, 9, 1, 0, 0, 100],
                position: 0
            },
            {
                name: "The Quad Squad",
                progress: [6, 4, 9, 1, 0, 0, 100],
                position: 0
            },
        ];

    // use interval to advance player positions by day
    var raceInterval = setInterval(function () {
        var dayFinished = 0;
        for (var t = 0; t < teams.length; t++) {
            var team = teams[t];

            if (day >= team.progress.length) {
                clearInterval(raceInterval);
                return;
            }

            // count down progress for each day before moving on to next one
            if (team.progress[day] > 0) {
                team.progress[day]-=0.3;
                team.position += 10;
            } else {
                dayFinished++;
            }
        }

        // check all teams have completed run for today
        if(dayFinished == teams.length){
            day++;
        }
        animCounter++;

    }, 50);

    }, 3000);



    ctx.textAlign = "left";
    ctx.fillStyle = "rgb(255, 50, 50)";
    ctx.lineWidth=6;
    ctx.strokeStyle = "rgb(255, 255, 255)";

    function loop(timestamp) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var camera = size.width - 300;

        if(teams.length > 0){
            // scroll view to keep leader on the left edge
            var leader = teams.reduce(function (prev, current) {
                return (prev.position > current.position) ? prev : current
            }).position;

            if (leader > camera) {
                camera = leader;
            }

            // draw layers for each player
            for (var t = 0; t < teams.length; t++) {
                var team = teams[t];
                var rowY = (t * rowSpace) + rowSpace;

                // player position on screen
                var playerX = ((size.width - 300) - (team.position)) + (camera - (size.width - 400));

                drawSnowLayer(snowImages[t % snowImages.length], camera, rowY, t * 200);

                // draw player character
                ctx.drawImage(reindeerImages[Math.round(team.position / 30) % reindeerImages.length], playerX, rowY - 100, 300, 300);
                ctx.drawImage(elfImages[t % elfImages.length], playerX, rowY - 100, 300, 300);

            }

            // draw text for each player
            for (var t = 0; t < teams.length; t++) {
                var team = teams[t];
                var rowY = (t * rowSpace) + rowSpace;

                // player position on screen
                var playerX = ((size.width - 300) - (team.position)) + (camera - (size.width - 400));

                // draw trailing text
                ctx.font = "30px 'Luckiest Guy', Charcoal, sans-serif";
                var textPos = Math.min(playerX + 290, size.width - ctx.measureText(team.name).width - 10);
                ctx.strokeText(team.name,
                    textPos,
                    rowY + 80);
                    ctx.fillText(team.name,
                        textPos,
                        rowY + 80);

                ctx.font = "25px 'Luckiest Guy', Charcoal, sans-serif";
                ctx.strokeText(Math.floor(team.position / 33.3) + " hours",
                    textPos,
                    rowY + 105);
                ctx.fillText(Math.floor(team.position / 33.3) + " hours",
                    textPos,
                    rowY + 105);
            }
        }

        // fill rest of the screen with snow layers if there's less than 10 teams
        for (var t = teams.length; t < 10; t++) {
            var rowY = (t * rowSpace) + rowSpace;
           drawSnowLayer(snowImages[t % snowImages.length], camera, rowY, t * 200);
        }

        // day counter text
        ctx.font = "60px 'Luckiest Guy', Charcoal, sans-serif";
        ctx.strokeText("Day "+(day+1),
            size.width - 250,
            size.height - 120);
            ctx.fillText("Day "+(day+1),
                size.width - 250,
                size.height - 120);

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    function drawSnowLayer(image, progress, verticalOffset, initialOffset) {
        if (image.width <= 0) {
            return;
        }
        var offset = ((progress - initialOffset) % 800) - 800;
        while (offset - 800 < size.width) {
            ctx.drawImage(image, offset, verticalOffset, 800, 200);
            offset += 800;
        }
    }

    function loadImage(src) {
        var img = new Image();
        img.src = src;
        return img;
    }

});