
$(function () {

    var teams = [
        //{
        //    name: "Santa's Little Helpers",
        //    progress: [5, 2, 5, 3, 9, 28, 3],
        //    position: 0
        //},
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

    var northPoleSign = loadImage("images/NorthPole.svg");

    var camera = 0;
    var size = { width: 1920, height: 1080 }
    var rowSpace = 120; //Math.min(120, size.height / (teams.length + 1));

    var animCounter = 0;
    var day = 0;


    //snowflake particles
    var angle = 0;
    var mp = 55; //max particles
    var particles = [];

    ctx.textAlign = "left";

    function loop(timestamp) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgb(255, 50, 50)";
        ctx.lineWidth = 6;
        ctx.strokeStyle = "rgb(255, 255, 255)";

        var camera = size.width - 300;

        ctx.drawImage(northPoleSign, size.width - 500, -30, 200, 200)

        if (teams.length > 0) {
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
        ctx.strokeText("Day " + (day + 1),
            size.width - 230,
            70);
        ctx.fillText("Day " + (day + 1),
            size.width - 230,
            70);


        drawSnow(ctx, timestamp);

        requestAnimationFrame(loop);
    }
    setupSnow();
    requestAnimationFrame(loop);




    // load data
    window.callback = function (data) {

        data.Leaderboard.forEach((leader, ind) => {

            var link = leader.Name;
            if (leader.Link !== '') {
                link = `<a title="Sponsor ${leader.Name}" href="${leader.Link}">${leader.Name}</a>`;
            }

            $('.leaderboard tbody').append(`<tr>
						  <th scope="row">${ind + 1}</th>
						  <td>${link}</td>
						  <td>${Math.round(leader.Total*100)/100}</td>
                        </tr>`);

            teams.push({
                name: leader.Name,
                progress: leader.Progress,
                position: 0
            });
        });

        // alphabetical order
        teams = teams.sort(function(a, b) {
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

        rowSpace = Math.min(120, size.height / (teams.length + 1));

        setTimeout(function () {

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
                        team.progress[day] -= 0.3;
                        team.position += 10;
                    } else {
                        dayFinished++;
                    }
                }

                // check all teams have completed run for today
                if (dayFinished == teams.length) {
                    day++;
                }
                animCounter++;

            }, 50);

        }, 1000);
    }
    $('head').append($('<script src="https://gsheetcounter.azurewebsites.net/api/GetProgress?sheet=santadash&callback=window.callback"></script>'));


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




    // Snow
    function setupSnow() {
        for (var i = 0; i < mp; i++) {
            particles.push({
                x: Math.random() * size.width, //x-coordinate
                y: Math.random() * size.height, //y-coordinate
                r: Math.random() * 6 + 2, //radius
                d: Math.random() * mp //density
            })
        }
    }

    function drawSnow(ctx, timestamp) {
        ctx.fillStyle = "rgba(240, 240, 255, 0.9)";
        ctx.beginPath();
        for (var i = 0; i < mp; i++) {
            var p = particles[i];
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        }
        ctx.fill();
    }
    function update() {
        angle += 0.01;
        for (var i = 0; i < mp; i++) {
            var p = particles[i];
            //Updating X and Y coordinates
            //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
            //Every particle has its own density which can be used to make the downward movement different for each flake
            //Lets make it more random by adding in the radius
            p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
            p.x += Math.sin(angle) * 2;

            //Sending flakes back from the top when it exits
            //Lets make it a bit more organic and let flakes enter from the left and right also.
            if (p.x > size.width + 5 || p.x < -5 || p.y > size.height) {
                if (i % 3 > 0) //66.67% of the flakes
                {
                    particles[i] = { x: Math.random() * size.width, y: -10, r: p.r, d: p.d };
                }
                else {
                    //If the flake is exitting from the right
                    if (Math.sin(angle) > 0) {
                        //Enter from the left
                        particles[i] = { x: -5, y: Math.random() * size.height, r: p.r, d: p.d };
                    }
                    else {
                        //Enter from the right
                        particles[i] = { x: size.width + 5, y: Math.random() * size.height, r: p.r, d: p.d };
                    }
                }
            }
        }
    }
    setInterval(update, 5);




});