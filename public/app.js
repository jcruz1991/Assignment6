var main = function() {
    'use strict';
    $('#sign-in-form').show();
    $('#newQuestionForm').hide();
    $('#startNewRound').hide();
    $('#answerForm').hide();
    $('#answer_Two .result_Two_ID').hide();
    $('#scoreArea').hide();

    var socket = io.connect('http://localhost:3000', {
        reconnect: true
    });

    // Update User List
    socket.on("update-users", function(user) {
        $("#users").empty();
        $.each(user, function(clientID, name) {
            $('#users').append("<li>" + name + "</li>");
        });
    });

    socket.on("get-question", function(id, question) {
        $('#answer_Two .correctAnswer').empty();
        $('#answerInputFromAnswerForm').val('');
        $('#answer_Two .result_Two_ID').text(id);
        $('#answer_Two .result_Two_Question').text('Question: ' + question);
    });

    socket.on("get-correct", function(user, answer) {
        $.get('score', function(res) {
            $('#scoreArea #right').text("Right: " + res.right);
            $('#scoreArea #wrong').text("Wrong: " + res.wrong);
        });
        $('#answer_Two .correctAnswer').append("<br>" + user + ":" + answer);
    });

    function QuestionModel() {
        this.Question = ko.observable("");
        this._id = ko.observable("");
        this.right = ko.observable("");
        this.wrong = ko.observable("");

        var right = this.right;
        var wrong = this.wrong;

        $.get('score', {right, wrong}, function(res) {
            right(res.right);
            wrong(res.wrong);
        });

        this.correctAnswer = ko.observable("");
        var correctAnswer = this.correctAnswer;

        self.submitQuestionToDatabase = function() {
            if ($('#questionInput').val() !== '') {

                var question = $('#questionInput').val();
                var answer = $('#answerInput').val();

                $.ajax({
                    type: "POST",
                    url: 'question',
                    data: JSON.stringify({
                        "Question": question,
                        "Answer": answer
                    }),
                    success: function(res) {
                        $('#answer .result').text('Question: ' + res.Question + " Answer: " + res.Answer);
                    },
                    contentType: "application/json",
                    dataType: 'json'
                });
            }
            return false;
        };

        self.submitUserName = function() {
            if ($('#usernameInput').val() !== '') {
                var username = $('#usernameInput').val();
                socket.emit('join', username);
                $('#userInputDiv').hide();
                $('#startNewRound').show();
                $('#answerForm').show();
                $('#newQuestionForm').show();
                $('#scoreArea').show();
            }
            return false;
        };

        self.checkAnswer = function() {
            if ($('#idInput').val() !== '') {
                var ID = $('#answer_Two .result_Two_ID').text();
                var answer = $('#answerInputFromAnswerForm').val();
                $.ajax({
                    type: "POST",
                    url: 'answer',
                    data: JSON.stringify({
                        "ID": ID,
                        "Answer": answer
                    }),
                    success: function(res) {
                        socket.emit('answer', res.correct);
                    },
                    contentType: "application/json",
                    dataType: 'json'
                });
            }
            return false;
        };

        self.getQuestion = function() {
            $('#answer_Two .correctAnswer').empty();
            $('#answerInputFromAnswerForm').val('');
            var question = this.Question;
            var id = this._id;
            $.get('question', {question, id}, function(res) {
                socket.emit('getQuestion', res._id, res.Question);
                if (res.length === 0) {
                    question('Database is Empty!');
                } else {
                    question(res.Question);
                    id(res._id);
                }
            });
            return false;
        };
    }

    // Activates knockout.js
    ko.applyBindings(new QuestionModel());
};

$(document).ready(main);
