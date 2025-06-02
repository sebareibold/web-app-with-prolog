# Generación de HTML en SWI-Prolog

Existen principalmente dos formas de generar HTML en SWI-Prolog:

1.  **Usando un DSL (Domain Specific Language) basado en DCG (Definite Clause Grammars).**
    *   Este es el método más "estilo Prolog".
    *   Se utiliza la librería `library(http/html_write)`.
    *   El núcleo de este método es el DCG `html//1`, que transforma una especificación de árbol DOM en una lista de tokens HTML.
    *   Para enviar una página HTML completa, se usa el predicado `reply_html_page/2`, que toma un `Head` y un `Body`. Estos suelen ser listas de especificaciones para el contenido de las etiquetas `<head>` y `<body>` respectivamente.
    *   Dentro de la especificación (Spec del DCG `html//1`), los elementos HTML se representan como **términos**:
        *   `Tag(Content)`: Para elementos sin atributos.
        *   `Tag(Attributes, Content)`: Para elementos con atributos.
    *   `Content` puede ser texto atómico (que se escapa automáticamente para garantizar HTML válido), u una lista de especificaciones para elementos anidados.
    *   Los `Attributes` pueden ser un solo atributo o una lista de atributos, representados como `Name=Value` o `Name(Value)`. Si `Value` es una lista, se concatena con espacios.
    *   Este método permite anidar estructuras de forma intuitiva y modularizar la generación de partes del HTML en predicados DCG separados.

2.  **Usando plantillas.**
    *   Las fuentes mencionan esta alternativa pero no profundizan en su implementación específica.

El método utilizando en nuestro código es el DSL basado en DCG. Por el uso de `reply_html_page/2` y la estructura de los términos `head(...)` y `body(...)` conteniendo especificaciones de elementos como `title(...)`, `h1(...)`, y `p(...)` con atributos.


:- user:file_search_path(assets_alias, 'assets').: Define un nuevo alias llamado assets_alias. Cuando Prolog encuentre una ruta que empiece con assets_alias(...), buscará ese archivo o directorio dentro del directorio físico 'assets' (relativo a donde está tu archivo .pl). Usamos user: para que esta definición esté disponible globalmente para el usuario actual.

- http_handler('/assets/', http_reply_from_files(assets_alias('.'), []), [prefix]).: 

    El primer argumento assets_alias('.') usa el alias que definimos. . se refiere a la raíz del directorio asociado al alias ('assets').

    http_reply_from_files/2 (usado en el contexto de http_handler) toma la ruta del archivo/directorio (en este caso, assets_alias('.')) y una lista de opciones para http_reply_from_files. La lista [] aquí significa que no pasamos opciones adicionales a from_files.

    La opción [prefix] sigue siendo necesaria para el http_handler mismo, e indica que cualquier URL que empiece con /assets/ será manejada por este predicado, y la parte restante de la URL se usará para encontrar el archivo dentro del directorio assets.