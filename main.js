import * as THREE from 'three';
        // ORBIT CONTROLS utility (enable moving camera with mouse)
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        // GUI to control the light and sphere materials
        import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
        import { Sky } from 'three/addons/objects/Sky.js';
        // Import MathUtils do pacote three
        import { MathUtils } from 'three';

        // create an empty scene, that will hold all our elements such as objects, cameras and lights
        const scene = new THREE.Scene();

        const textureCube = new THREE.CubeTextureLoader()
                .setPath("./textures/")
                .load([
                    "posx.bmp","negx.bmp",
                    "posy.bmp","negy.bmp",
                    "posz.bmp","negz.bmp"
                ])
    
        // Configurando o skybox como fundo da cena
        scene.background = textureCube;

        // create a camera, which defines where we're looking at
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
        camera.position.set(1, 300, -300);
        camera.lookAt(new THREE.Vector3(1, 500, 200)); // point camera

        let activeCamera = camera; // Define a câmera ativa inicialmente
        
        // create a render and set the size
        const renderer = new THREE.WebGLRenderer({ antialias: false }); // aliasing (jagged edges when rendering)
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x8a8a8a);
        document.body.appendChild(renderer.domElement);

        /*********************
        * ORBIT CONTROLS 
        *********************/
        const controls = new OrbitControls(camera, renderer.domElement);


        /*****************************
        * MESHES 
        * ***************************/
        
        // Textures
        const groundTexture = new THREE.TextureLoader().load("./textures/Poliigon_GrassPatchyGround_4585_BaseColor.jpg");
        let normal = new THREE.TextureLoader().load("./textures/Poliigon_GrassPatchyGround_4585_Normal.png");
        let displacement = new THREE.TextureLoader().load("./textures/Poliigon_GrassPatchyGround_4585_Displacement.tiff");

        //Ground
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;

        groundTexture.repeat.set(50, 50); // Repete a textura 10x10 vezes

        const groundGeometry = new THREE.PlaneGeometry(10000, 10000, 32, 32); // Tamanho do plano (100x100)
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            map: groundTexture, 
            side: THREE.DoubleSide,
            normalMap: normal,
            displacementMap: displacement,
            displacementScale: 0.2,
            displacementBias: -0.0135
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        
        ground.rotation.x = -Math.PI / 2; // Rotacionar para ficar na posição horizontal
        ground.receiveShadow = true; // Permitir que o chão receba sombras
        // Adicionar o chão à cena
        scene.add(ground);

        // Curvatura do arco
        class ArcCurve extends THREE.Curve {
            constructor(radius = 5, startAngle = 0, endAngle = Math.PI) {
                super();
                this.radius = radius;
                this.startAngle = startAngle;
                this.endAngle = endAngle;
            }
    
            getPoint(t) {
                const angle = this.startAngle + t * (this.endAngle - this.startAngle);
                const x = this.radius * Math.cos(angle);
                const y = this.radius * Math.sin(angle);
                return new THREE.Vector3(x, y, 0); // plano XY
            }
        }

        //Caracter
        let caracter = {
            x: 0, y: 0, z: 0,
            ry: 0, angle: 0,
            body: null, head: null,
            upperArms: [],lowerArms: [], upperLegs: [], lowerLegs: [], shoulders: [], hips:[], knees:[], elbows:[],
            material: new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false }),
            skin: new THREE.MeshLambertMaterial({
                map:  new THREE.TextureLoader().load("./textures/human-skin1_albedo.png"),
                normalMap: new THREE.TextureLoader().load("./textures/human-skin1_normal-ogl.png"),
            }),
            vests:new THREE.MeshPhongMaterial({
                map:  new THREE.TextureLoader().load("./textures/Leather_Armor_003_basecolor.png"),
                normalMap: new THREE.TextureLoader().load("./textures/Leather_Armor_003_normal.png"),
                displacementMap: new THREE.TextureLoader().load("./textures/Leather_Armor_003_height.png"),
                displacementScale: 0.1,
                displacementBias: -0.135
            }),

            init() {
                // Create body
                const bodyGeometry = new THREE.BoxGeometry(30, 45, 20)
                this.body = new THREE.Mesh(bodyGeometry, this.vests)
                scene.add(this.body)
                this.body.position.y = 70

                // Create head
                const headGeometry = new THREE.BoxGeometry(25, 25, 25)
                this.head = new THREE.Mesh(headGeometry, this.skin)
                this.body.add(this.head)
                this.head.position.y = 35

                // Legs
                /// Hip - pivot
                for (let i = 0; i < 2; i++) {
                    const hip = new THREE.Object3D();
                    const m = i % 2 === 0 ? 1 : -1

                    this.body.add(hip)
                    this.hips.push(hip)
                    hip.position.x = m * 12
                    hip.position.y = -22.5                    
                }
                /// Create upperLegs
                const upperLegsGeometry = new THREE.BoxGeometry(7.5, 24, 7.5)
                for (let i = 0; i < 2; i++) {
                    const upperleg = new THREE.Mesh(upperLegsGeometry, this.vests)
                    const m = i % 2 === 0 ? 1 : -1

                    this.hips[i].add(upperleg)
                    this.upperLegs.push(upperleg)
                    upperleg.position.x = i % 2 === 0 ? -3 : 3
                    upperleg.position.y = -12
                }
                /// Knee - pivot
                for (let i = 0; i < 2; i++) {
                    const knee = new THREE.Object3D();
                    const m = i % 2 === 0 ? 1 : -1

                    this.hips[i].add(knee)
                    this.knees.push(knee)
                    knee.position.x = m * -3
                    knee.position.y = -22.5
                }
                /// Create lowerLegs
                const lowerLegsGeometry = new THREE.BoxGeometry(7.5, 24, 7.5)
                for (let i = 0; i < 2; i++) {
                    const lowerleg = new THREE.Mesh(lowerLegsGeometry, this.vests)
                    const m = i % 2 === 0 ? 1 : -1

                    this.knees[i].add(lowerleg)
                    this.lowerLegs.push(lowerleg)
                    lowerleg.position.x = 0
                    lowerleg.position.y = -12
                }

                // Arms
                /// shoulder - pivot
                for (let i = 0; i < 2; i++) {
                    const shoulder = new THREE.Object3D();
                    const m = i % 2 === 0 ? 1 : -1

                    this.body.add(shoulder)
                    this.shoulders.push(shoulder)
                    shoulder.position.x = m * -17.5
                    shoulder.position.y = 20                
                }
                /// upperArms
                const upperArmsGeometry = new THREE.BoxGeometry(7.5, 20, 7.5)
                for (let i = 0; i < 2; i++) {
                    const upperArm = new THREE.Mesh(upperArmsGeometry, this.vests)
                    const m = i % 2 === 0 ? 1 : -1

                    this.shoulders[i].add(upperArm)
                    this.upperArms.push(upperArm)
                    upperArm.position.x = m 
                    upperArm.position.y = -10
                }
                /// Elbows - pivot
                for (let i = 0; i < 2; i++) {
                    const elbow = new THREE.Object3D();
                    const m = i % 2 === 0 ? 1 : -1

                    this.upperArms[i].add(elbow)
                    this.elbows.push(elbow)
                    elbow.position.x = m
                    elbow.position.y = -10
                }
                /// lowerArms
                const lowerArmsGeometry = new THREE.BoxGeometry(5.5, 20, 5.5)
                for (let i = 0; i < 2; i++) {
                    const lowerArm = new THREE.Mesh(lowerArmsGeometry, this.skin)
                    const m = i % 2 === 0 ? 1 : -1

                    this.elbows[i].add(lowerArm)
                    this.lowerArms.push(lowerArm)
                    lowerArm.position.x = 0
                    lowerArm.position.y = -10
                }
            },
            startPosicion() {
                if (shootingPosition && phase == 0){
                    if (this.shoulders[0].rotation.z > -1.5) {
                        
                        this.shoulders[0].rotation.z -=0.05
                        this.shoulders[0].rotation.y -=0.017
                        this.shoulders[0].position.x +=0.1 

                        this.head.rotation.y += THREE.MathUtils.degToRad(2)

                        camera2.rotation.y += THREE.MathUtils.degToRad(2)
                        camera2.rotation.z += THREE.MathUtils.degToRad(1.2)
                        camera2.position.x += 5
                        camera2.position.z -= 2
                        camera2.position.y += 2

                        bow.handle.rotation.x -= THREE.MathUtils.degToRad(1.8);
                        bow.handle.rotation.y += THREE.MathUtils.degToRad(3);
                        
                        this.shoulders[1].rotation.x +=THREE.MathUtils.degToRad(6)
                        this.elbows[1].rotation.x += THREE.MathUtils.degToRad(3);
                        this.elbows[0].rotation.x += THREE.MathUtils.degToRad(1.2); //////////////////////////////////

                        //criação da Flecha
                        if (this.shoulders[1].rotation.x > 3) {                            
                            phase = 1
                            console.log(strengthInput.value);
                            arrow.init(new THREE.Vector3(0, 25, 0), new THREE.Vector3(2, Number(strengthInput.value), 0));

                            bow.string.add(arrow.group);
                        }
                    }
                }
                else if (phase === 1) {
                    if (this.shoulders[1].rotation.x > 1) {
                        this.shoulders[1].rotation.x -=THREE.MathUtils.degToRad(3);
                        this.shoulders[1].rotation.z -=THREE.MathUtils.degToRad(1);
                        this.shoulders[1].position.z -= 0.09
                        this.elbows[1].rotation.x -= THREE.MathUtils.degToRad(1.5);
                        this.elbows[1].rotation.z -= THREE.MathUtils.degToRad(0.7);
                        bow.updateString(stringAux)
                        stringAux += 0.05
                        if (this.shoulders[1].rotation.x < 1) {
                            phase = 2   
                        }
                    }       
                }
                else if (phase === 2) {
                    if (this.shoulders[0].rotation.z > -1.7) {
                        
                        this.shoulders[0].rotation.z -=THREE.MathUtils.degToRad(0.5);
                        this.shoulders[1].rotation.z +=THREE.MathUtils.degToRad(2.5);
                        this.elbows[1].rotation.z -=THREE.MathUtils.degToRad(3.6); 
                        this.elbows[1].rotation.y -=THREE.MathUtils.degToRad(1.2); 
                        this.elbows[1].rotation.x -=THREE.MathUtils.degToRad(1);                         
                        bow.updateString(stringAux);
                        stringAux += 1;
                        
                        arrow.group.position.y -= 0.8;
                        if (this.shoulders[0].rotation.z < -1.7) {
                            phase = 3; 
                        }
                    }       
                }   
                else if (phase === 3) {
                    arrow.updatePosition(0.5);
                    bow.updateString(stringAux);
                    if (stringAux>0) {
                        stringAux -= 1;                        
                    }
                }             
            },
        }
        //Bow
        let bow ={
            wood: null,
            handle: null,
            string: null, 
            radius: 25, 
            thickness: 0.5,
            stringLength: 0,
            stringGeometry: null, // Armazena a geometria da corda

            init(){
                // Criar o arco principal
                const startAngle = 0;
                const endAngle = Math.PI;
                const arcPath = new ArcCurve(this.radius, startAngle, endAngle);

                // Criar a pega 
                this.handle = new THREE.Object3D();
                this.handle.position.y = -10;
                this.handle.position.x = -1
                this.handle.rotation.x = THREE.MathUtils.degToRad(180);
                this.handle.rotation.y = THREE.MathUtils.degToRad(90);

                caracter.lowerArms[0].add(this.handle);

                //Cria o Arco de madeira                
                const bowGeometry =  new THREE.TubeGeometry(arcPath, 100, 0.6, 8, false);
                const bowMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
                this.wood = new THREE.Mesh(bowGeometry, bowMaterial);
                this.handle.add(this.wood);
                this.wood.position.y = -25;
                
                //Cria a corda do arco
                const stringMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
                this.stringGeometry = new THREE.BufferGeometry();
                let stringPoints = [
                    new THREE.Vector3(-this.radius, 0, 0), // Ponto esquerdo
                    new THREE.Vector3(0, -this.stringLength, 0), // Ponto central (esticado)
                    new THREE.Vector3(this.radius, 0, 0), // Ponto direito
                ];
                this.stringGeometry.setFromPoints(stringPoints);
                this.string = new THREE.Line(this.stringGeometry, stringMaterial);
                this.wood.add(this.string);                
            },
            // Atualizar a corda
            updateString(newStringLength) {
                this.stringLength = newStringLength;

                // Atualiza os pontos da corda
                const stringPoints = [
                    new THREE.Vector3(-this.radius, 0, 0), // Ponto esquerdo
                    new THREE.Vector3(0, -this.stringLength, 0), // Ponto central (esticado)
                    new THREE.Vector3(this.radius, 0, 0), // Ponto direito
                ];
                // Atualiza a geometria da corda
                this.stringGeometry.setFromPoints(stringPoints);
            },
        }

        let arrow = {
            group: null, // Grupo que contém os componentes da flecha
            velocity: new THREE.Vector3(0, 0, 0), // Velocidade inicial
            gravity: new THREE.Vector3(0.1, 0, 0), // Gravidade aplicada
            init(position = new THREE.Vector3(0, 0, 0), velocity = new THREE.Vector3(0, 0, 0)) {
                this.group = new THREE.Group(); // Grupo principal da flecha
                this.velocity.copy(velocity); // Define a velocidade inicial
                this.createArrow(); // Método que cria os componentes da flecha
                this.group.position.copy(position); // Posiciona a flecha no espaço
            },
            createArrow() {
                // Corpo da flecha (shaft)
                const shaftGeometry = new THREE.CylinderGeometry(1, 1, 50, 8);
                const shaftMaterial = new THREE.MeshPhongMaterial({ color: 0x804000 });
                const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
                shaft.position.y = 0; // Centralizado no grupo
                this.group.add(shaft);
        
                // Ponta da flecha (tip)
                const tipGeometry = new THREE.ConeGeometry(2, 3, 9);
                const tipMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
                const tip = new THREE.Mesh(tipGeometry, tipMaterial);
                tip.position.y = 26; // No topo do shaft
                this.group.add(tip);
        
                // Penas da flecha (feathers)
                const featherGeometry = new THREE.ConeGeometry(2, 10, 16);
                const featherMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
                for (let i = 0; i < 3; i++) {
                    const feather = new THREE.Mesh(featherGeometry, featherMaterial);
                    feather.position.y = -26; // No final do shaft
                    feather.rotation.x = Math.PI / 2; // Alinhar as penas
                    feather.rotation.z = (Math.PI * 2 * i) / 3; // Espaçamento de 120 graus
                    this.group.add(feather);
                }

                // Adiciona ao arco
                bow.string.add(this.group);
            },
            updatePosition(deltaTime) {
                // Atualiza a posição da flecha com base na velocidade e gravidade

                let result = this.checkCollisions()

                if (!result) {
                    this.velocity.add(this.gravity.clone().multiplyScalar(-deltaTime)); // Aplica gravidade
                    this.group.position.add(this.velocity.clone().multiplyScalar(deltaTime)); // Atualiza posição
                      
                    if (this.group.position.x < 0) {
                        this.group.rotation.z += THREE.MathUtils.degToRad(0.3)
                    }
                }
                else{
                    displayShootAgain.style.display = "block"
                }
            },
            checkCollisions() {
                let arrow = new THREE.Box3().setFromObject(this.group);
    
                let obst = new THREE.Box3().setFromObject(ground);
                let collision = arrow.intersectsBox(obst);
                if (collision) {
                    console.log("HIT")
                    return true;
                }
                
                return false;
            }
        };

        //inicialização
        caracter.init()
        bow.init()
        /* END CHARACTER DEFINITION */
        
        const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        camera2.position.set(0, 150, 150); // Atrás e acima do personagem
        camera2.lookAt(caracter.head.position);


        /*********************
        * LIGHTS 
        *********************/
        let light = new THREE.AmbientLight(0xffffff, Math.PI * 0.5);
        scene.add(light);

        let light2 = new THREE.PointLight(0xffffff, Math.PI * 20 );
        light2.position.set(0, 70, 7);
        scene.add(light2);
        // light helper
        let pointLightHelper = new THREE.PointLightHelper(light2, 0.4);
        pointLightHelper.name = "helper";
        scene.add(pointLightHelper);
 
        // set the animation function
        renderer.setAnimationLoop(render);

        // Update renderer (and camera) on window resize
        window.addEventListener('resize', () => {
            // Update camera
            activeCamera.aspect = window.innerWidth / window.innerHeight
            activeCamera.updateProjectionMatrix()

            // Update renderer
            renderer.setSize(window.innerWidth, window.innerHeight);
            // Adjust the pixel ratio of the renderer based on the device's pixel density
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        })

        /*********************
        * KEY HANDLING 
        *********************/
        let phase = 0
        let stringAux = 0;
        let shootingPosition = false;

        let displayShoot = document.querySelector(".shoot")
        let displayShootAgain = document.querySelector(".shootAgain")
        let strengthInput = document.querySelector(".strength")
        console.log(displayShoot.style.display);
        
        document.addEventListener("keydown", (e) => {
            // TODO
            if (e.key === '1') {
                activeCamera = camera; // Alterna para a câmera 1
                console.log("Câmera 1 ativada");
            } else if (e.key === '2') {
                activeCamera = camera2; // Alterna para a câmera 2
                console.log("Câmera 2 ativada");
            }
            if (e.key == "F" || e.key == "f") {        
                shootingPosition = true
                displayShoot.style.display = "none"
            }

            if ((e.key == "a" || e.key == "A") && displayShootAgain.style.display == "block") {
                caracter.shoulders[0].rotation.x = 0
                caracter.shoulders[0].rotation.y = 0
                caracter.shoulders[0].rotation.z = 0
                caracter.shoulders[0].position.x = -17.5 


                caracter.shoulders[1].rotation.x = 0
                caracter.shoulders[1].rotation.y = 0
                caracter.shoulders[1].rotation.z = 0
                caracter.shoulders[1].position.z = 0

                caracter.elbows[1].rotation.z = 0
                caracter.elbows[1].rotation.y = 0 
                caracter.elbows[1].rotation.x = 0 

                caracter.elbows[0].rotation.z = 0
                caracter.elbows[0].rotation.y = 0 
                caracter.elbows[0].rotation.x = 0 
                
                bow.handle.rotation.x = THREE.MathUtils.degToRad(180);
                bow.handle.rotation.y = THREE.MathUtils.degToRad(90);
                
                caracter.head.rotation.y = 0

                camera2.position.set(0, 150, 150);
                camera2.rotation.y = 0
                camera2.rotation.z = 0

                phase = 0;
            }
        })

        
        function render() {   

            caracter.startPosicion();
            // render the scene into viewport using the camera
            renderer.render(scene, activeCamera);
        }
