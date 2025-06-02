# 🌐 Web Declarativa con SWI-Prolog

Proyecto básico que demuestra cómo crear una aplicación web simple en SWI-Prolog, sirviendo archivos HTML y CSS mediante el módulo http_dispatch.

Se exploran conceptos como:

*   Servidor HTTP embebido (`http_server`)
*   Rutas declarativas (`http_handler`)
*   Respuesta dinámica y archivos estáticos (`http_reply_file/3`, `http_reply_from_files/3`)

## ▶️ Cómo ejecutar

1.  Cloná el proyecto:

    ```bash
    git clone https://github.com/sebareibold/web-declarativa-en-prolog.git
    cd web-declarativa-en-prolog
    ```

2.  Abrí SWI-Prolog y cargá el servidor:

    ```prolog
    ?- consult('web.pl')
    ?- servidor(8080).
    ```

3.  Abrí en el navegador:

    [http://localhost:8080/](http://localhost:8080/)

## 🛠️ Requisitos

*   SWI-Prolog (versión 8.x o superior)

## 👨‍💻 Autor

Sebastián Alejandro Reibold
Nicanor Fernandez
Bautista Fernandez Gramajo
GitHub
