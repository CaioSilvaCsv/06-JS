//quadro do jogo
let jogo;
let jogoWidth = 375;
let jogoHeight = 500;
let context;

let tamanhoNavegador = window.innerWidth;
if (tamanhoNavegador >800) jogoWidth = 500;

//jogador
let jogadorWidth = 80;
let jogadorHeight = 10;
let jogadorSpeedX =  10;

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

let velocidadeBolaX = 3;
let velocidadeBolaY = 2; 

//bola
let bolaWidth = 10;
let bolaHeight = 10;
let bolaVelocityX = velocidadeBolaX;
let bolaVelocityY = velocidadeBolaY;

let bola = {
    x : numAleatorio(0, jogoWidth-10),
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
let blockColumns = 6;
if (jogoWidth == 500) blockColumns = 8;
let blockRows = 3; // É adicionado mais ao decorrer do jogo.
let blockMaxRows = 10;
let blockCount = 0;

//iniciando os blocos no topo esquerdo.
let blockX = 15;
let blockY = 45;

//Sobre a dificuldade
let alturaNivel = 10;


window.onload = function(){
    jogo = document.getElementById("jogo");
    jogo.height = jogoHeight;
    jogo.width = jogoWidth;
    context = jogo.getContext("2d"); //feito para desenhar o jogo.
    nomeJogador = jogadorNome();
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
        context.fillStyle = "yellow";
        context.fillRect(jogadorComputador.x, jogadorComputador.y
            , jogadorComputador.width, jogadorComputador.height);
    
        let jogadorComputadorCentro = jogadorComputador.x + jogadorComputador.width / 2;
        if (bolaComputador.y > (jogoHeight / 2) - 30 && bolaComputador.velocityY > 0) {
                if (bolaComputador.x > jogadorComputadorCentro) {
                let nextJogadorX = jogadorComputador.x + jogadorComputadorSpeedX;
                if (!limites({ x: nextJogadorX, width: jogadorComputadorWidth })) {
                    jogadorComputador.x = nextJogadorX;
                }
            }
            else if (bolaComputador.x < jogadorComputadorCentro) {
                let nextJogadorX = jogadorComputador.x - jogadorComputadorSpeedX;
                if (!limites({ x: nextJogadorX, width: jogadorComputadorWidth })) {
                    jogadorComputador.x = nextJogadorX;
                }
            }
        }
    }else{
        bolaVelocityX = 3;
        bolaVelocityY = 2;
    }
    
    //bola
    context.fillStyle = "white";
    bola.x += bola.velocityX;
    bola.y += bola.velocityY;
    context.fillRect(bola.x, bola.y, bola.width, bola.height);

    //Bola computador
    if(modoComputador){
        context.fillStyle = "yellow";
        bolaComputador.x += bolaComputador.velocityX;
        bolaComputador.y += bolaComputador.velocityY;
        context.fillRect(bolaComputador.x, bolaComputador.y, bolaComputador.width, bolaComputador.height);
    }

    //A detecção da bola batendo nas paredes e o rebote e caso toque no "chão" será descontado 100 pontos.
    if (fim = rebote(bola) == 1) pontuacao - 100;
    if (fim = rebote(bolaComputador) == 1 ) pontuacaoComputador - 100;

    if(((bola.velocityX == 0) && (bola.velocityY == 0)) && ((bolaComputador.velocityX == 0) && (bolaComputador.velocityY == 0))) fimJogo();

    // bater a bola e subir novamente.
    if(topColisao(bola, jogador) || bottomColisao(bola, jogador)){
        bola.velocityY *= -1; //Virar y, seja pra cima ou pra baixo.

    }else if(leftColisao(bola, jogador) || rightColisao(bola, jogador)){
        bola.velocityX *= -1; // Virar x
    }

    // bater a bola e subir novamente no modo computador.
    if(modoComputador){
        if(topColisao(bolaComputador, jogadorComputador) || bottomColisao(bolaComputador, jogadorComputador)){
            bolaComputador.velocityY *= -1; //Virar y, seja pra cima ou pra baixo.
            
        }else if(leftColisao(bolaComputador, jogadorComputador) || rightColisao(bolaComputador, jogadorComputador)){
            bolaComputador.velocityX *= -1; // Virar x
        }
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
            else if(topColisao(bolaComputador, block) || bottomColisao(bolaComputador, block)){
                block.break = true;
                bolaComputador.velocityY *= -1; //Mudar a direção de y, para cima ou para baixo.
                blockCount -= 1;
                pontuacaoComputador += 100;
            }else if(leftColisao(bolaComputador, block) || rightColisao(bolaComputador, block)){
                block.break = true;
                bolaComputador.velocityX *= -1; //mudar a direção de x, direita ou esquerda.
                blockCount -= 1;
                pontuacaoComputador += 100;
            }
        
           context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    //quando acabar os blocos.
    if (blockCount == 0){
        pontuacao += 100*blockRows*blockColumns; //Pontuação extra
        pontuacaoComputador += 100*blockRows*blockColumns;
        proximoNivel(bola, jogador);
        proximoNivel(bolaComputador, jogadorComputador);
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }

    //Pontuação
    context.font = "15px serif";
    context.fillText(pontuacao, 10, 20);
    context.fillText(nomeJogador, 10, 35)
    if(modoComputador){
        context.fillText(pontuacaoComputador, jogoWidth-50, 20);
        context.fillText("Computador", jogoWidth-80, 35);
    }

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

//limite da bola na parede
function rebote(bola){
        
    if(bola.y <= 0){
        //se a bola tocar no topo do canvas.
        bola.velocityY *= -1;
        
    }else if(bola.x <= 0 || (bola.x + bola.width)>= jogoWidth){
        //Se a bola tocar na borda lateral do canva.
        bola.velocityX *= -1;
    }else if(bola.y + bola.height>= jogoHeight){
        //Se a bola tocar embaixo do canva
        bola.velocityX = 0;
        bola.velocityY = 0;
        return 1;     
    }
}

function dificuldade(){
    let select = document.getElementById("dificuldade");
    var nivel = select.value;
    
    var dificuldade = "facil";

    if(nivel != dificuldade)resetGame();

    if(nivel == "facil"){
        alturaNivel = 10;
    }else if(nivel == "medio"){
        alturaNivel = 20;
    }else if(nivel == "dificil"){
        alturaNivel = 30;
    }
}

function proximoNivel(bola, jogador){
    if(bola.velocityX < 0 || bola.velocityY < 0){
        if(bola.velocityX < 0) bola.velocityX *= -1;
        if(bola.velocityY < 0) bola.velocityY *= -1
        bola.velocityX += .5;
        bola.velocityY += .5;
    }else{
        bola.velocityX += .5;
        bola.velocityY += .5;
    }
    if(jogador.y >= (jogoHeight/2)-30){
        jogador.y -= alturaNivel;
    }
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

    velocidadeBolaX = 3;    
    velocidadeBolaY = 2; 

    jogador = {
        x: jogoWidth/2 - jogadorWidth/2,
        y:  jogoHeight - jogadorHeight - 5,
        width: jogadorWidth,
        height: jogadorHeight,
        velocityX: jogadorSpeedX
    };

    jogadorComputador = {
        x: jogoWidth / 2 - jogadorComputadorWidth / 2,
        y: jogoHeight - jogadorHeight - 5,
        width: jogadorComputadorWidth,
        height: jogadorComputadorHeight,
        velocityX: jogadorComputadorSpeedX
    };

    bola = {
        x : numAleatorio(0, jogoWidth-10),
        y : jogoHeight/2,
        width : bolaWidth,
        height : bolaHeight,
        velocityX : bolaVelocityX,
        velocityY : bolaVelocityY
    }

    bolaComputador = {
        x : numAleatorio(0, jogoWidth-10),
        y : jogoHeight/2,
        width : bolaWidth,
        height : bolaHeight,
        velocityX : bolaCVelocityX,
        velocityY : bolaCVelocityY
    }

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
    context.fillStyle = "white"
    frase("sans-serif","Fim de jogo: Precione 'Espaço' para reiniciar.", 420);
    context.font="25px monospace";
    frase("25px monospace",`${nomeJogador} adiquiriu ${pontuacao} pontos.`, 200);
    if(modoComputador) ganhador(pontuacao, pontuacaoComputador);
    salvaPontuacao(nomeJogador, pontuacao);
    listarRanking();
    gameOver = true;
}

//para definir no meio da tela a frase
function frase(font, frase, posicao){
    context.font = font;
    let largura = (jogoWidth-context.measureText(frase).width)/2;
    context.fillText(frase, largura, posicao);
}

//Faz a comparação com as pontuações e verifica quem ganhou 
function ganhador(pt, ptC){
    let ganhador = pt == ptC ?  " Houve um empate " : pt > ptC ? "Você ganhou" :  "O computador ganhou";
    frase("15px monospace", `${ganhador}`, 400);
}


//parte do jogador computador:
let modoComputador = false;

let jogadorComputadorWidth = 80;
let jogadorComputadorHeight = 10;
let jogadorComputadorSpeedX = 5;//Velocidade de movimento do jogador.
let pontuacaoComputador = 0;

let jogadorComputador = {
    x: jogoWidth / 2 - jogadorComputadorWidth / 2,
    y: jogoHeight - jogadorHeight - 5,
    width: jogadorComputadorWidth,
    height: jogadorComputadorHeight,
    velocityX: jogadorComputadorSpeedX
};

//Bola do computador
let bolaCVelocityX = velocidadeBolaX;
let bolaCVelocityY = velocidadeBolaX;

let bolaComputador = {
    x : numAleatorio(0, jogoWidth-10),
    y : jogoHeight/2,
    width : bolaWidth,
    height : bolaHeight,
    velocityX : bolaCVelocityX,
    velocityY : bolaCVelocityY
}