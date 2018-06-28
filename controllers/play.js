const Sequelize = require("sequelize");
const {models} = require("../models");

/*let score = 0;
let cuestionarios = [];*/

exports.loadQuestion = (req, res, next) => {
		
	if (req.session.cuestionarios === undefined || req.session.cuestionarios.length === 0) {

		//reinicio la puntuación
		req.session.score = 0;

		//query a la base de datos para sacar todas las preguntas
	    models.quiz.findAll()
	    .then(quizzes => {
	    	//guardamos los quizzes y el índice de la pregunta actual en session de req
	    	req.session.cuestionarios = quizzes;
	    	req.session.index = Math.floor(Math.random()*quizzes.length);

	    	//paso la pregunta y la puntuación actual a la vista correspondiente
	        res.render('random_play', {
	        	quiz: req.session.cuestionarios[req.session.index],
	        	score: req.session.score
	        });
	    })
	    .catch(error => next(error));


	} else {

		req.session.index = Math.floor(Math.random()*req.session.cuestionarios.length);
    	//paso la pregunta y la puntuación actual a la vista correspondiente jijicd
        res.render('random_play', {
        	quiz: req.session.cuestionarios[req.session.index],
        	score: req.session.score
		});
    }
	
};

exports.comprobar = (req, res, next) => {

	models.quiz.findById(req.params.id)
	.then(quiz => {
		//resultado de si la respuesta introducida coincide con la correcta
		let resultado = false;

		//comparo la respuesta
		if (req.query.answer.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") 
	            === quiz.answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")) {
			req.session.score++;
			resultado = true;
			req.session.cuestionarios.splice(req.session.index, 1);
			if(req.session.cuestionarios.length === 0){
				req.session.cuestionarios = undefined;
				res.render('random_nomore', {
			    	score: req.session.score
			    });
			} else {
				res.render('random_result', {
			    	score: req.session.score,
			    	result: resultado,
			    	answer: req.query.answer
			    });
			}

		} else {

			req.session.cuestionarios = undefined;
			let ultimoScore = req.session.score;
			req.session.score = 0;
			res.render('random_result', {
		    	score: ultimoScore,
		    	result: resultado,
		    	answer: req.query.answer
		    });
		}
	})
	.catch(error => next(error));

};