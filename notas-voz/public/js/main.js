import {recordFn} from "/js/recordButton.js"
import {playFn} from "/js/play.js"
import {uploadFn} from "/js/upload.js"
import {v4 as uuid} from "/utils/uuid/v4.js";
//import {moment} from "/utils/moment/moment.js";



moment.locale('es');
let escuchar

window.onload = function()
{
    const lirecordbutton = document.getElementById('liRecordButton')
    lirecordbutton.innerHTML = recordFn();

    const liplaybutton = document.getElementById('play')
    liplaybutton.innerHTML = playFn();
    document.getElementById('play1').disabled =true

    const liuploadbutton = document.getElementById('upload')
    liuploadbutton.innerHTML = uploadFn();
    const uploadbuttonreal = document.getElementById('upload1')
    uploadbuttonreal.disabled = true

    let app = new App(null,new Blob() ,'inactive');
    app.init()

    let grabar = false;
    escuchar = false;

    document.getElementById('record').addEventListener('click', () => {
        if(grabar===false)
        {   
            
            grabar=true;
            app.record();
        }
        else{
            grabar=false;

            app.stopRecording();

            document.getElementById('play1').disabled = false;
            uploadbuttonreal.disabled = false
        }
        // Reemplaza appInstance con la instancia de tu clase App
    });
    uploadbuttonreal.onclick = function () {

        app.upload();
    }


    document.getElementById('play1').addEventListener('click', () => {
        
        
        if(escuchar===false)
        {
            escuchar=true;
            app.playAudio();

        }
        else{
            escuchar=false;
            app.stopAudio();
        }


        // Reemplaza appInstance con la instancia de tu clase App
    });

    fetch('/api/list')
        .then(response => response.json())
        .then(data => {
          const fileList = document.getElementById('fileList');
          data.files.forEach(file => {
            const fileDiv = document.createElement('div');
            const copyButton = document.createElement('button');
            const deleteButton = document.createElement('button');

            copyButton.innerText = '📋';
            deleteButton.innerText = '🗑️';

            fileDiv.textContent = moment(file.date).calendar().toLowerCase();
            fileDiv.appendChild(copyButton);
            fileDiv.appendChild(deleteButton);

            fileList.appendChild(fileDiv);
            copyButton.id = "copiar"
            copyButton.addEventListener('click', function(){
                navigator.clipboard.writeText(`localhost:3000/play/:${file.filename}`).then(()=>console.log(file));
                Snackbar.show({text: 'link copiado.'});
            });

            deleteButton.id="borrar"
            deleteButton.addEventListener('click', function(){
                fetch(`/api/delete/:30901411-a4c9-46b3-ba90-51728e05fae5/:${file.filename}`).
                then(r=> console.log(r)).
                error( err =>console.error(err))
            })
        })
            
        })
        .catch(error => {
          console.error('Error al obtener la lista de archivos:', error);
        });
    
    /** 
    fetch('/api/list/')
        .then(response => response.json())
        .then(data => {
            // Manejar los datos recibidos
            renderFileList(data.files);
        })
        .catch(error => console.error('Error fetching data:', error));

    function renderFileList(files) {
        // Renderizar la lista de archivos en la interfaz de usuario
        const fileListContainer = document.getElementById('fileListContainer');

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');

            // Agregar icono de copiar
            const copyIcon = document.createElement('span');
            copyIcon.innerText = '📋';
            copyIcon.addEventListener('click', () => copyFile(file.filename));
            fileItem.appendChild(copyIcon);

            // Agregar icono de borrar
            const deleteIcon = document.createElement('span');
            deleteIcon.innerText = '🗑️';
            deleteIcon.addEventListener('click', () => deleteFile(file.filename));
            fileItem.appendChild(deleteIcon);

            // Mostrar información del archivo
            const fileInfo = document.createElement('span');
            fileInfo.innerText = `${file.filename} - ${new Date(file.date)}`;
            fileItem.appendChild(fileInfo);

            fileListContainer.appendChild(fileItem);
        });
    }
    function copyFile(filename) {
        // Lógica para copiar el archivo
        console.log(`Copiar el archivo ${filename}`);
    }
    function deleteFile(filename) {
        // Lógica para borrar el archivo
        console.log(`Borrar el archivo ${filename}`);
    }*/
}
class App {
    audioChunks = [];
    isRecording = false;


    constructor(audio,blob,state) {
        this.audio = audio;
        this.blob=blob;
        this.state = state;
        this.secondsCounter=0;
    }
    async init(){
        try {

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.initAudio();
            await this.initRecord(stream);

        } catch (error) {
            console.error('No se ha podido acceder al micrófono', error);
        }
    }

    initAudio(){
        this.audio = new Audio();

        this.audio.onloadedmetadata = () => {

            console.log('Se ha cargado la información del audio ');
            this.setState({state: 'cargado'})

        };

        this.audio.ondurationchange = () => {
            console.log('Ha cambiado la duración del audio ' );

        };

        this.audio.ontimeupdate = () => {
            console.log('Tiempo de reproducción actualizado');
            this.setState({state: 'reproduciendo'})
        };

        this.audio.onended = () => {
            console.log('El audio ha finalizado');
            this.setState({state: 'finalizado'})
            escuchar=false;

        }
    }

    async initRecord(stream) {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);

        };

        this.mediaRecorder.onstop = () => {
            this.blob = new Blob(this.audioChunks, {type: 'audio/wav'});
            this.loadBlob();
            //const audioPlayer = document.getElementById('audioPlayer');
            //audioPlayer.src = this.audio.src;

        };
    }
    loadBlob()
    {
        this.audio.src= URL.createObjectURL(this.blob);

    }
    setState(state) {
        this.state = Object.assign({}, this.state, state);
        this.render();
    }

    render() {

       //let tiempoactualensegundos = this.audio.currentTime
        //let total = Math.round(duracionensegundos-tiempoactualensegundos)
        if(this.state=='inactive'){
            let tiempoinactive = this.convertirSegundosAMinutosYSegundos(300- this.secondsCounter)
            document.getElementById('record').textContent = `Record ${tiempoinactive}`;
        }
        if(this.state['state']== 'cargado'){
            let tiempocargado = this.convertirSegundosAMinutosYSegundos(this.secondsCounter)
            document.getElementById('play1').textContent = `Play ${tiempocargado}`;
        }
        if(this.state['state']== 'reproduciendo')
        {
            let tiempoplay = this.convertirSegundosAMinutosYSegundos(this.secondsCounter -  Math.round(this.audio.currentTime))
        document.getElementById('play1').textContent = `Play ${tiempoplay}`;
        
        }
        if(this.state['state']== 'finalizado')
        {
            let tiempofinalizado = this.convertirSegundosAMinutosYSegundos(this.secondsCounter)
        document.getElementById('play1').textContent = `Play ${tiempofinalizado}`;
        
        }

    }

    record(){

        if (!this.isRecording) {
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.startTimer()
            //document.getElementById('start').textContent = 'Parar la grabación';
            //document.getElementById('stop').disabled = false;
        } else {
            if (this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.pause();
                //document.getElementById('start').textContent = 'Continuar la grabación';
            } else if (this.mediaRecorder.state === 'paused') {
                this.mediaRecorder.resume();
                
                //document.getElementById('start').textContent = 'Parar la grabación';
            }
        }
    }

    stopRecording(){
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();

            //document.getElementById('stop').disabled = true;
            //document.getElementById('start').textContent = 'Empezar grabación';
            this.isRecording = false;
            this.stopTimer()
        }
    }

    playAudio(){

        if (this.audio && this.blob) {
            this.audio.play();
        }

    }

    stopAudio(){
        if (this.audio) {
            this.audio.pause();
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.secondsCounter++;
            console.log(this.secondsCounter);
            this.render()
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }
    convertirSegundosAMinutosYSegundos(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        
        if (segundosRestantes<10){
            return `${minutos}:0${segundosRestantes}`;
        }
        else if(minutos==-1)
        {
            return `0:00`
        }
        else{
            return `${minutos}:${segundosRestantes}`;
        }

        
      }

      upload(){
        this.setState({ uploading: true }); // estado actual: uploading
        const body = new FormData(); // Mediante FormData podremos subir el audio al servidor
        body.append("recording", this.blob); // en el atributo recording de formData guarda el audio para su posterior subida
        fetch("/api/upload/" + this.uuid, {
            method: "POST", // usaremos el método POST para subir el audio
            body,
        })
            .then((res) => res.json()) // el servidor, una vez recogido el audiodevolverá la lista de todos los ficheros a nombre del present usuario (inlcuido el que se acaba de subir)
            .then((json) => {
                this.setState({
                    files: json.files, // todos los ficheros del usuario
                    uploading: false, // actualizar el estado actual
                    uploaded: true, // actualizar estado actual
                });
            })
            .catch((err) => {
                this.setState({ error: true });
            });
      }
}

//document.getElementById('stopBtn').addEventListener('click', stopRecording);

