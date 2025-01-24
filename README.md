Descrição Geral

  Este projeto utiliza a biblioteca Three.js para renderizar uma cena tridimensional interativa. O ambiente inclui um personagem animado, um arco, flechas e elementos adicionais como o solo texturizado e um sistema de iluminação. O utilizador pode controlar diferentes aspetos da cena através de comandos do teclado e interagir dinamicamente com os objetos.

Controlo e Interação
Câmeras Interativas:

O projeto oferece duas perspetivas que podem ser alternadas pelo utilizador:
Câmara Livre (pressionar tecla 1): Permite ao utilizador navegar pela cena através do rato, utilizando os OrbitControls.
Câmara de Terceira Pessoa (pressionar tecla 2): Foca o personagem, acompanhando os seus movimentos.
Sistema de Disparo com o Arco:

Posição de Tiro (tecla F): Quando ativada, o personagem adota uma postura de disparo, ajustando dinamicamente as articulações (ombros, cotovelos) e a corda do arco.
Disparo: Uma flecha é gerada e disparada, com cálculos físicos simulando gravidade e colisões com o solo.
Reinício da Posição de Tiro (tecla A): Restabelece a posição inicial do personagem e prepara-o para um novo disparo.

Força do Disparo:

Um slider interativo permite ao utilizador ajustar a força aplicada à flecha antes de disparar, influenciando a velocidade inicial e a trajetória.
Animações e Física:

O movimento do personagem e o comportamento do arco e da flecha são animados dinamicamente. A física do movimento da flecha inclui:
Efeitos de gravidade.

Colisões com o solo.

Feedback Visual:

Mensagens na interface informam o utilizador sobre os comandos disponíveis e o estado do disparo (pronto para disparar novamente ou em recarga).
Elementos Técnicos

Texturização: O solo e o personagem utilizam texturas detalhadas para maior realismo.
Controlo Dinâmico: Classes e métodos personalizáveis, como para a atualização da corda do arco e o movimento do personagem.
Iluminação: Uma combinação de luz ambiente e luzes pontuais para criar profundidade e destacar os elementos.

