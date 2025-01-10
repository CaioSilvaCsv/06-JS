//quadro do jogo
let jogo;
let jogoWidth = 500;
let jogoHeight = 500;
let context;

//jogador
let jogadorWidth = 80;
let jogadorHeight = 10;
let jogadorSpeedX =  10

let nomeJogador = "";

let jogador = {
    x: jogoWidth/2 - jogadorWidth/2,
    y:  jogoHeight - jogadorHeight - 5,
    width: jogadorWidth,
    height: jogadorHeight,
    velocityX: jogadorSpeedX
}

let pontuacao = 0;
let gameOver = false;


//bola
let bolaWidth = 10;
let bolaHeight = 10;
let bolaVelocityX = 3;
let bolaVelocityY = 2;

let bola = {
    x : numAleatorio(0, 500),
    y : jogoHeight/2,
    width : bolaWidth,
    height : bolaHeight,
    velocityX : bolaVelocityX,
    velocityY : bolaVelocityY
}

//Blocos
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3; // É adicionado mais ao decorrer do jogo.
let blockMaxRows = 10;
let blockCount = 0;

//iniciando os blocos no topo esquerdo.
let blockX = 15;
let blockY = 45;


window.onload = function(){
    jogo = document.getElementById("jogo");
    nomeJogador = jogadorNome();
    jogo.height = jogoHeight;
    jogo.width = jogoWidth;
    context = jogo.getContext("2d"); //feito para desenhar o jogo.

    //Desenhar inicio do jogo.
    context.fillStyle = "lightgreen";
    context.fillRect(jogador.x, jogador.y, jogador.width, jogador.height);

    requestAnimationFrame(update);
    document.addEventListener("mousemove", moveJogador);
    document.addEventListener("keydown", function(e){
        if(gameOver){
            if(e.code == "Space") resetGame();
            return;
        }
    });

    let computador = document.getElementById("checkbox");
    computador.addEventListener("change", function(){
        modoComputador = computador.checked;
    });

    //Criando os blocos.
    createBlocks();
    listarRanking();

}

function update(){

    requestAnimationFrame(update);

    if (gameOver){
        return;
    }

    context.clearRect(0,0,jogo.width, jogo.height);

    //jogador
    context.fillStyle = "lightgreen";
    context.fillRect(jogador.x, jogador.y, jogador.width, jogador.height);

    //jogador computador
    if(modoComputador){
        context.fillStyle = "red";
        context.fillRect(jogadorComputador.x, jogadorComputador.y
            , jogadorComputador.width, jogadorComputador.height);
    
        let jogadorComputadorCentro = jogadorComputador.x + jogadorComputador.width / 2;
        if (bola.x > jogadorComputadorCentro) {
            let nextJogadorX = jogadorComputador.x + jogadorComputadorSpeedX;
            if (!limites({ x: nextJogadorX, width: jogadorComputadorWidth })) {
                jogadorComputador.x = nextJogadorX;
            }
        }
         else if (bola.x < jogadorComputadorCentro) {
            let nextJogadorX = jogadorComputador.x - jogadorComputadorSpeedX;
            if (!limites({ x: nextJogadorX, width: jogadorComputadorWidth })) {
                jogadorComputador.x = nextJogadorX;
            }
        }
    }
    
    //bola
    context.fillStyle = "white";
    bola.x += bola.velocityX;
    bola.y += bola.velocityY;
    context.fillRect(bola.x, bola.y, bola.width, bola.height);

    //limite da bola na parede
    if(bola.y <= 0){
        //se a bola tocar no topo do canvas.
        bola.velocityY *= -1;

    }else if(bola.x <= 0 || (bola.x + bola.width)>= jogoWidth){
        //Se a bola tocar na borda lateral do canva.
        bola.velocityX *= -1;
    }else if(bola.y + bola.height>= jogoHeight){
        //Se a bola tocar embaixo do canva
        //Fim de jogo
        if(modoComputador){
            pontuacaoComputador++;
            bola.velocityY*= -1;
            if(pontuacaoComputador == 4){
                context.font = "15px sans-serif";
                context.fillText(" O computador ganhou!", 180, 400);
                fimJogo();
            }
        }else{
            context.font = "15px sans-serif";
            fimJogo();
        }        
    }

    // bater a bola e subir novamente.
    if(topColisao(bola, jogador) || bottomColisao(bola, jogador)){
        bola.velocityY *= -1; //Virar y, seja pra cima ou pra baixo.

    }else if(leftColisao(bola, jogador)){
        bola.velocityX *= -1; // Virar x
    }

    //blocos
    context.fillStyle = "skyblue";
    for (let i = 0; i < blockArray.length; i++){
        let block = blockArray[i];
        if(!block.break){
            if(topColisao(bola, block) || bottomColisao(bola, block)){
                block.break = true;
                bola.velocityY *= -1; //Mudar a direção de y, para cima ou para baixo.
                blockCount -= 1;
                pontuacao += 100;
            }else if(leftColisao(bola, block) || rightColisao(bola, block)){
                block.break = true;
                bola.velocityX *= -1; //mudar a direção de x, direita ou esquerda.
                blockCount -= 1;
                pontuacao += 100;
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    //quando acabar os blocos.
    if (blockCount == 0){
        pontuacao += 100*blockRows*blockColumns; //Pontuação extra
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }

    //Pontuação
    context.font = "20px serif";
    context.fillText(pontuacao, 10, 25);
    if(modoComputador) context.fillText(pontuacaoComputador, 450, 25);
}

function limites(xPosition){
    return (xPosition.x < 0 || xPosition.x + xPosition.width > jogoWidth);
}

function moveJogador(e){

    let mouseX = e.clientX - jogo.offsetLeft;

    jogador.x = mouseX-jogadorWidth/2;

    if(jogador.x + jogadorWidth >= jogoWidth) jogador.x = jogoWidth - jogadorWidth;
    else if(jogador.x <= 0) jogador.x = 0;
    
}

function detectorColisao(a, b){
    return  a.x < b.x + b.width && 
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}

function topColisao (bola, block){      // a encima b ( bola quando toca no bloco)
    return detectorColisao(bola, block) && (bola.y + bola.height) >= block.y;
}

function bottomColisao(bola, block){    // a embaixo de b(bola quando toca na base)
    return detectorColisao(bola, block) && (block.y + block.height) >= bola.y;
}

function leftColisao(bola, block){      // a a esquerda de b (bola quando toca na lateral esquerda do bloco)
    return detectorColisao(bola, block) && (bola.x + bola.width) >= block.x;
}

function rightColisao(bola, block){     // a a direita de b (bola quando toca na lateral direita do bloco)
    return detectorColisao(bola, block) && (block.x + block.width) <= bola.x;
}

function createBlocks(){
    blockArray = [];
    for (let c = 0; c < blockColumns; c++){
        for (let r = 0; r < blockRows; r++){
            let block = {
                x : blockX + c*blockWidth + c*10,   // adiciona 10 pixels de distancia entre colunas.
                y : blockY + r*blockHeight + r*10,  // adiciona 10 pixels de distancia entre linhas.
                width   : blockWidth,
                height  : blockHeight,
                break : false 
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame(){
    nomeJogador = jogadorNome();
    gameOver = false;

    jogador = {
        x: jogoWidth/2 - jogadorWidth/2,
        y:  jogoHeight - jogadorHeight - 5,
        width: jogadorWidth,
        height: jogadorHeight,
        velocityX: jogadorSpeedX
    };

    jogadorComputador = {
        x: jogoWidth / 2 - jogadorComputadorWidth / 2,
        y: 5,
        width: jogadorComputadorWidth,
        height: jogadorComputadorHeight,
        velocityX: jogadorComputadorSpeedX
    };

    bola = {
        x : numAleatorio(0, 500),
        y : jogoHeight/2,
        width : bolaWidth,
        height : bolaHeight,
        velocityX : bolaVelocityX,
        velocityY : bolaVelocityY
    };

    blockArray = [];
    blockRows = 3;
    pontuacao = 0;
    pontuacaoComputador = 0;
    createBlocks();
}

function numAleatorio(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function listarRanking(){
    const lista = document.getElementById("ranking");
    lista.innerHTML = "";

    const rankingString = localStorage.getItem('ranking');
    let ranking = rankingString ? JSON.parse(rankingString) : [];

    ranking.forEach((jogador, i) =>{
        const li = document.createElement('li');
        li.textContent = `${i+1}º - ${jogador.nome}: ${jogador.pontuacao}`
        lista.appendChild(li);
    })

}

function jogadorNome(){

    nome = prompt("Digite o seu nome: ");

    if(nome === "" || nome === null) {
        window.alert("O nome atribuído será -O careca-")
        nome = "O careca";
    }
    return nome;    
}

function salvaPontuacao(jogadorNome, pontuacao){
    let ranking = JSON.parse(localStorage.getItem('ranking')) || [];

    if(jogadorNome && pontuacao !== undefined){
        ranking.push({
            nome: jogadorNome,
            pontuacao: pontuacao
        });
        ranking.sort((a,b)=> b.pontuacao - a.pontuacao);//Guarda ordenado;
        ranking = ranking.slice(0,10); //Limita a 10 pessoas guardadas;
        localStorage.setItem('ranking', JSON.stringify(ranking)); //salva o ranking atualizando no local storage
        
    }
}

function fimJogo(){
    context.fillText("Fim de jogo: Precione 'Espaço' para reiniciar.", 100, 420);
    context.font="25px monospace";
    context.fillText(`${nomeJogador} adiquiriu ${pontuacao} pontos.`, 50, 200);
    salvaPontuacao(nomeJogador, pontuacao);
    listarRanking();
    gameOver = true;
}


//parte do jogador computador:
let modoComputador = false;

let jogadorComputadorWidth = 80;
let jogadorComputadorHeight = 10;
let jogadorComputadorSpeedX = 10;
let pontuacaoComputador = 0;
let pontuacaoJogador = 0;

let jogadorComputador = {
    x: jogoWidth / 2 - jogadorComputadorWidth / 2,
    y: 5,
    width: jogadorComputadorWidth,
    height: jogadorComputadorHeight,
    velocityX: jogadorComputadorSpeedX
};
