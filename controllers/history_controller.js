
var URL = require('url');

const HISTORY_SIZE = 20;

// Middlewares

/**
 * Borra la historia anterior.
 *
 * @param req
 * @param res
 * @param next
 */
function reset(req, res, next) {

    req.session.history = ["/"];
    dump(req.session.history);
    next();
};

/**
 * Añade la URL actual a la historia, eliminado repetidos.
 *
 * @param req
 * @param res
 * @param next
 */
function push(req, res, next) {

	req.session.history = req.session.history || [];

	var url0 = req.session.history.slice(-1)[0] || "";
	var path0 = URL.parse(url0).pathname;

	var path1 = URL.parse(req.url).pathname;

	// Eliminar duplicados seguidos
	if (path0 === path1) {
		req.session.history.pop()
	}

	req.session.history.push(req.url);

	// Limitar tamaño de la historia
    req.session.history = req.session.history.slice(-HISTORY_SIZE);

	dump(req.session.history);

	next();
};

/**
 * No mete la URL actual en la historia.
 *
 * @param req
 * @param res
 * @param next
 */
function skip(req, res, next) {

    req.session.history = req.session.history || [];

    dump(req.session.history);

    next();
};

/**
 * Elimina el ultimo URL de la historia.
 *
 * @param req
 * @param res
 * @param next
 */
function pop(req, res, next) {

    req.session.history = req.session.history || [];

	req.session.history.pop();

    dump(req.session.history);

    next();
};


function goBack(req, res, next) {

	req.session.history = req.session.history || [];

	req.session.history.pop();
	var url = req.session.history.pop() || "/";
	res.redirect(url);
};


function reload(req, res, next) {

	req.session.history = req.session.history || [];

	var url = req.session.history.pop() || "/";
	res.redirect(url);
};


function dump(history) {

	console.log("-->> HISTORY");

	history.forEach(function(url, i) {
		console.log("  -->> ",i,"=",url);
	});
};


module.exports = {
	reset: reset,
	push: push,
	pop: pop,
	skip: skip,
	reload: reload,
	goBack: goBack
};

