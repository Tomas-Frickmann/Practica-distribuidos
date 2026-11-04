

 ¿Qué ocurre si un bibliotecario es degradado mientras su token sigue vigente?

 Si el rol se tomara  del JWT:
 Como los jwt una vez emitidos no se pueden revocar como si la familia de losrefresh, este seguiria activo y el bibliotecario podria seguir ejecutanto peticiones a las cuales no deberia tener acceso. Esto seria asi hasta que se termine el tiempo de vida del token, que en este caso es de 15 minutos, y ahi si no podria ejecutar mas funciones ya que el rol seria socio

En el caso aplicado en esta tarea la cosa seria diferente ya que el rol se saca del usuario levantado de la base por el validate el cual siempre va a estar actualizado (siempre y cuando se haga bien ). Este rol tiraria error en el rolesguarda que verifica que el mismo se encuentre demtro de los que pide el endpoint 

Pagine GET /libros por desplazamiento. Defina los parámetros, los valores por defecto y un
límite máximo, y rechace con un error adecuado los valores inválidos. Decida qué metadatos
devolver junto con los datos y justifique la elección en el README.

Al principio devolvía sólo pagina y total pero luego de avanzar con los ejercicios me vi ante la necesidad de devolver más cosas por eso termine devolviendo 

Total: Cantidad total de registros que coinciden con los filtros aplicados.
página: Número de la página actual.
límite: Tamaño de página 
TotalPaginas: Calculado como Math.ceil(total / limite).

elegí esta forma de devolver los datos porque fue la que entendi y me resultó más sencilla de aplicar 

. Agregue paginación por cursor sobre el catálogo, ordenado por título. El cursor debe ser opaco para el cliente, funcionar correctamente con títulos repetidos y mantener un recorrido consistente si se agregan libros mientras se recorre. Justifique si ofrece o no el total de elementos 

No se ofrece el total de elementos ya que sino se pierde la gracia del cursor. En este caso solo se devuelve el siguiente lo cual evita que se recorra la base de datos de forma completa para obtener solo este numero, para solucionar la parte de saber si sigue habiendo mas datos se pide uno mas del limite ya que si la consulta me devuelve 21 elementos quiere decir que por lo menos hay uno mas para venir a buscar luego, además como el curso se usa típicamente en scroll infinito no me interesa saber cuantas paginas/ datos hay 
