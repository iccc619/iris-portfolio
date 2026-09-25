// Homepage
document.addEventListener("DOMContentLoaded", () => {
    // Show welcome alert only on first visit to index.html 
    const hasVisited = localStorage.getItem("hasVisitedMarioWorld");

    if (
        (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") &&
        !hasVisited
    ) {
        alert("Welcome to Mario’s World");
        localStorage.setItem("hasVisitedMarioWorld", "true");
    }

    // Display Date
    const dateDisplay = document.getElementById("date-display");
        if (dateDisplay) {
            const today = new Date();
            dateDisplay.textContent = today.toDateString();
        }

    // Back to Top
    const backToTop = document.getElementById("backToTop");
        if (backToTop) {
            backToTop.onclick = () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }
}); 

// Equipment section
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.equipment-img');
    const textScroll = document.querySelector('.equipment-text-scroll');
    const prevBtn = document.querySelector('.prev');
    const afterBtn = document.querySelector('.after');
    let index = 0;

function updateEquipment(index) {
    // update image
    images.forEach((img, i) => {
        img.classList.toggle('active', i === index);
    });

    // scroll text
    const offset = -index * 300; // each block is 300px
    textScroll.style.transform = `translateY(${offset}px)`;
}

    prevBtn.addEventListener('click', () => {
        index = (index - 1 + images.length) % images.length;
        updateEquipment(index);
    });

    afterBtn.addEventListener('click', () => {
        index = (index + 1) % images.length;
        updateEquipment(index);
    });
});

// Character image slide in
document.addEventListener("DOMContentLoaded", () => {
    const character = document.querySelector('.character-img');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            character.classList.add('animate');
            observer.unobserve(character); // Just animate once
        }
        });
    }, { threshold: 0.5 }); // Adjust visibility threshold

    observer.observe(character);
});

// Courses// 

// Gallery auto-scroll effect
document.addEventListener("DOMContentLoaded", () => {
    let gallery = document.querySelector('.gallery');
    let scrollSpeed = 1.5;
    let scrollDelay = 20;
    
    if (gallery) {
        gallery.innerHTML += gallery.innerHTML;
    
        gallery.addEventListener('wheel', e => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
            }
        }, { passive: false });
    
        function autoScroll() {
            if (gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth) {
                gallery.scrollLeft = 0;
            } else {
                gallery.scrollLeft += scrollSpeed;
            }
        }
    
        setInterval(autoScroll, scrollDelay);
    }
});

//Chracter slide in as scroll to the point
document.addEventListener('DOMContentLoaded', () => {
    const character = document.querySelector('.character-spin .character');
    const observerTarget = document.querySelector('.character-spin');
  
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                character.classList.add('show');
                observer.unobserve(entry.target); // run only once
            }
        });
    }, { threshold: 0.5 });
  
    if (observerTarget) {
        observer.observe(observerTarget);
    }
});  

// Card-slider
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.card-slider');
    const container = document.querySelector('.card-container');

    if (!slider || !container) return;

    let isDown = false;
    let startX, scrollLeft, moveDistance = 0, startTime = 0;
    const click_threshold = 10;
    const time_threshold = 300;

    container.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', e => e.preventDefault());
    });

    container.querySelectorAll('.cup-bg').forEach(bg => {
      bg.style.cursor = 'pointer';
    });

    // Mouse down 
    slider.addEventListener('mousedown', e => {
        container.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        moveDistance = 0;
        startTime = Date.now();
    });

    // Mouse leave 
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });

    // Mouse up 
    slider.addEventListener('mouseup', e => {
        isDown = false;
        container.classList.remove('active');
    });

    // Mouse move 
    slider.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        let x = e.pageX - slider.offsetLeft;
        let walk = (x - startX) * 2;
        moveDistance = walk;
        slider.scrollLeft = scrollLeft - walk;
    });

    // Touch start 
    slider.addEventListener('touchstart', e => {
        isDown = true;
        container.classList.add('active');
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        moveDistance = 0;
        startTime = Date.now();
    });

    // Touch end 
    slider.addEventListener('touchend', e => {
        isDown = false;
        container.classList.remove('active');
    });

    // Touch move 
    slider.addEventListener('touchmove', e => {
        if (!isDown) return;
        e.preventDefault();
        let x = e.touches[0].pageX - slider.offsetLeft;
        let walk = (x - startX) * 2;
        moveDistance = walk;
        slider.scrollLeft = scrollLeft - walk;
    }, { passive: false });

    // Model popup for card-slider images (all cups)
    const modal = document.getElementById('myModel');
    const modalImageList = document.getElementById('modelImageList');
    const captionText = document.getElementById('caption');
    const closeBtn = document.querySelector('.close');

    if (!modal || !modalImageList || !captionText || !closeBtn) {
        console.warn('Modal elements not found. Check HTML IDs and class names.');
        return;
    }

    const cupNames = [
        'mushroom', 'flower', 'star', 'special',
        'shell', 'banana', 'leaf', 'lightening',
        'egg', 'triforce', 'crossing', 'bell'
    ];

    document.querySelectorAll('.card img').forEach((img, idx) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            if (idx < cupNames.length) {
                var cup = cupNames[idx];
                modal.style.display = 'block';
                modalImageList.innerHTML = [1,2,3,4].map(function(i) {
                    return `<img src="Assets/${cup} ${i}.jpg" alt="${cup.charAt(0).toUpperCase() + cup.slice(1)} Track ${i}">`;
                }).join('');
                captionText.innerHTML = cup.charAt(0).toUpperCase() + cup.slice(1) + ' Cup Tracks';
            }
        });
    });

    closeBtn.onclick = function() {
        modal.style.display = 'none';
        modalImageList.innerHTML = '';
        captionText.innerHTML = '';
    };

    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            modalImageList.innerHTML = '';
            captionText.innerHTML = '';
        }
    };
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            modalImageList.innerHTML = '';
            captionText.innerHTML = '';
        }
    });
});

// Items 

// Item interaction effects
document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".item-wrapper");
  const descBox = document.getElementById("description-box");
  const overlay = document.getElementById("overlay");
  setupitems (items, descBox, overlay);
  function setupitems(items, descBox, overlay) {
    for (let i = 0; i < items.length; i++) {
        (function(idx) {
            let item = items[idx];
            item.onmouseenter = function (e) {
                overlay.classList.add("active");
                item.classList.add("highlight");
                let desc = item.getAttribute("data-description");
                descBox.innerText = desc;
                descBox.style.display = "block";
            };
            
            item.onmousemove = function (e) {
                descBox.style.top = `${e.clientY + 20}px`;
                descBox.style.left = `${e.clientX + 20}px`;
            };
            
            item.onmouseleave = function () {
                overlay.classList.remove("active");
                item.classList.remove("highlight");
                descBox.style.display = "none";
            };
        })(i);
    }
  }
});

// Characters
document.addEventListener("DOMContentLoaded", () => {
    const iconWrappers = document.querySelectorAll('.icon-wrapper');
    const descriptionBox = document.getElementById('description-box');
    const overlay = document.getElementById('overlay');

    iconWrappers.forEach(wrapper => {
        wrapper.addEventListener('mouseenter', () => {
            overlay.style.display = 'block';
        });

        wrapper.addEventListener('mousemove', (e) => {
            const desc = wrapper.getAttribute('data-description');
            const rect = wrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            overlay.style.maskImage = `radial-gradient(circle 100px at ${centerX}px ${centerY}px, transparent 0%, black 100%)`;

            descriptionBox.style.display = 'block';
            descriptionBox.textContent = desc;
            descriptionBox.style.top = `${rect.top - 40}px`;
            descriptionBox.style.left = `${rect.left}px`;
        });

        wrapper.addEventListener('mouseleave', () => {
            overlay.style.display = 'none';
            descriptionBox.style.display = 'none';
        });
    });
});

// Battles
document.addEventListener("DOMContentLoaded", () => {
    const mainVideo = document.getElementById('main-video');
    const thumbnails = document.querySelectorAll('.thumbnails video');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const newSrc = thumb.getAttribute('src');
            mainVideo.setAttribute('src', newSrc);
            mainVideo.load();  // Reload the new video
            mainVideo.play();  // Play the video immediately
        });
    });
});

// ModeChoice popup
function showOverlay(id) {
    const overlays = document.querySelectorAll('.overlay');
    overlays.forEach(overlay => {
        overlay.style.display = 'none';
    });

    const target = document.getElementById(id);
    if (target) {
        target.style.display = 'flex';

        document.body.setAttribute('data-active-overlay', id);
    }
}

document.addEventListener('click', function () {
    const activeId = document.body.getAttribute('data-active-overlay');
    if (activeId) {
        const overlay = document.getElementById(activeId);
        if (overlay) {
            overlay.style.display = 'none';
            document.body.removeAttribute('data-active-overlay');
        }
    }
}, true);

// QUIZ// 
document.addEventListener('DOMContentLoaded', () => {
    const correctSound = new Audio('Assets/sound/mario_coin_sound.mp3');
    const wrongSound = new Audio('Assets/sound/mario_fail_sound.mp3');
    
    const quizData = [
        {
            question: "What is Mario's brother's name?",
            type: "multiple-choice",
            answers: ["Wario", "Luigi", "Bowser", "Yoshi"],
            correctAnswer: "Luigi",
            feedback: "Luigi is Mario's younger twin brother."
        },
        {
            question: "In what year was the first Super Mario Bros game released?",
            type: "number",
            correctAnswer: 1985,
            tolerance: 0,
            feedback: "Super Mario Bros was first released in 1985 for the NES."
        },
        {
            question: "When is Mario's official birthday? (Format: DD-MM-YYYY)",
            type: "date",
            correctAnswer: "1981-07-09",
            feedback: "Mario's birthday is July 9, 1981 according to Nintendo."
        },
        {
            question: "Which play mode allow 1v1 battle? ",
            type: "multiple-choice",
            answers: ["Grand Prix", "Time Trial", "VS Race", "Battle Mode"],
            correctAnswer: "VS Race",
            feedback: "VS Race mode allows you to race with another player alone."
        },
        {
            question: "What is the name of Mario's dinosaur companion?",
            type: "text",
            correctAnswer: "Yoshi",
            feedback: "Yoshi is Mario's loyal dinosaur friend."
        },
        {
            question: "How many characters are there in total in Mario Kart?",
            type: "number",
            correctAnswer: 42,
            tolerance: 0,
            feedback: "There are 42 standard characters to be chosen in Mario Kart."
        },
        {
            question: "What is the name of Mario's main villain?",
            type: "multiple-choice",
            answers: ["Wario", "Bowser", "Donkey Kong", "King Boo"],
            correctAnswer: "Bowser",
            feedback: "Bowser, the King of the Koopas, is Mario's arch-nemesis."
        },
        {
            question: "What item enable you to carry eight items at once?",
            type: "text",
            correctAnswer: "Eight",
            feedback: "Eight will help the play to race faster with eight items."
        },
        {
            question: "What is the quickest course speed?",
            type: "multiple-choice",
            answers: ["150cc", "200cc", "250cc", "300cc"],
            correctAnswer: "200cc",
            feedback: "200cc is the quickest speed players can choose in all courses."
        },
        {
            question: "What is the name of the princess Mario rescues?",
            type: "multiple-choice",
            answers: ["Peach", "Orange", "Apple", "Banana"],
            correctAnswer: "Peach",
            feedback: "Princess Peach is the ruler of the Mushroom Kingdom."
        }
    ];
  
    const introPage = document.getElementById('introPage');
    const quizPage = document.getElementById('quizPage');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const questionTextEl = document.getElementById('questionText');
    const inputContainer = document.getElementById('inputContainer');
    const submitBtn = document.getElementById('submitBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const resultEl = document.getElementById('result');
    const feedbackEl = document.getElementById('feedback');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
  
    // Quiz state
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];
    
    // Initialize quiz
    startQuizBtn.addEventListener('click', () => {
        introPage.style.display = 'none';
        quizPage.style.display = 'block';
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        resultEl.textContent = '';
        feedbackEl.textContent = '';
        showQuestion(currentQuestionIndex);
    });
    
    // Show current question
    function showQuestion(index) {
        const currentQ = quizData[index];
        questionTextEl.textContent = currentQ.question;
        inputContainer.innerHTML = '';
        feedbackEl.textContent = '';
        feedbackEl.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
    
        switch (currentQ.type) {
        case 'multiple-choice':
            createMultipleChoiceInput(currentQ);
            break;
        case 'text':
            createTextInput();
            break;
        case 'number':
            createNumberInput();
            break;
        case 'date':
            createDateInput();
            break;
        }
    }
    
    // Check answer
    submitBtn.addEventListener('click', () => {
        const currentQ = quizData[currentQuestionIndex];
        let userAnswer;
        let isCorrect = false;
        updateProgressBar(currentQuestionIndex + 1);
    
        // Check the answer based on the type of question
        switch (currentQ.type) {
        case 'multiple-choice':
            const selectedBtn = document.querySelector('.answer-btn.selected');
            if (!selectedBtn) return; 
            userAnswer = selectedBtn.textContent;
            isCorrect = userAnswer === currentQ.correctAnswer;
            break;
        case 'text':
            userAnswer = document.querySelector('input').value.trim().toLowerCase();
            isCorrect = userAnswer === currentQ.correctAnswer.toLowerCase();
            break;
        case 'number':
            userAnswer = parseInt(document.querySelector('input').value);
            isCorrect = userAnswer === currentQ.correctAnswer;
            break;
        case 'date':
            userAnswer = document.querySelector('input').value;
            isCorrect = userAnswer === currentQ.correctAnswer;
            break;
        }
    
        // Store the user's answer and whether it is correct
        userAnswers.push({
        question: currentQ.question,
        userAnswer: userAnswer,
        isCorrect: isCorrect
        });
    
        // Log answers and check correctness
        console.log(`Question: ${currentQ.question}`);
        console.log(`User Answer: ${userAnswer}`);
        console.log(`Correct Answer: ${currentQ.correctAnswer}`);
        console.log(`Is Correct: ${isCorrect}`);
        
        // Provide feedback after answering
        feedbackEl.style.display = 'block'; // Show feedback
        playSound(isCorrect);
        feedbackEl.textContent = isCorrect ? 
        `✅ Correct! ${currentQ.feedback}` : 
        `❌ Incorrect. ${currentQ.feedback}`;
    
        // Only update score if the answer is correct**
        if (isCorrect) {
            score++; 
            console.log(`Score incremented. Current score: ${score}`);
        } else {
            console.log(`Score not incremented. Current score: ${score}`);
        }
    
        // Log the score after the question
        console.log(`Score After Question ${currentQuestionIndex + 1}: ${score}`);
    
        // Show next button
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        nextBtn.disabled = false;
    });
    
    function createMultipleChoiceInput(question) {
        question.answers.forEach(answer => {
            const btn = document.createElement('button');
            btn.classList.add('answer-btn');
            btn.textContent = answer;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.answer-btn').forEach(b => 
                b.classList.remove('selected'));
                btn.classList.add('selected');
                submitBtn.disabled = false;
            });
            inputContainer.appendChild(btn);
        });
    }
    
    function createTextInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type your answer here...';
        input.addEventListener('input', () => {
            submitBtn.disabled = input.value.trim() === '';
        });
        inputContainer.appendChild(input);
    }
    
    function createNumberInput() {
        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'Enter a number...';
        input.addEventListener('input', () => {
            submitBtn.disabled = input.value === '';
        });
        inputContainer.appendChild(input);
    }
    
    function createDateInput() {
        const input = document.createElement('input');
        input.type = 'date';
        input.addEventListener('input', () => {
            submitBtn.disabled = input.value === '';
        });
        inputContainer.appendChild(input);
    }
    
    // Move to next question
    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        } else {
            showResult();
        }
    });
    
    function showResult() {
        progressBar.style.width = '100%';
        questionTextEl.textContent = "Quiz Completed!";
        inputContainer.innerHTML = '';
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    
        // Clear feedback so the last question's feedback doesn't show
        feedbackEl.textContent = '';
        feedbackEl.style.display = 'none'; 
    
        // Calculate the percentage score
        const percentage = Math.round((score / quizData.length) * 100);
        
        // Generate the result message based on the score
        let message;
        if (percentage >= 90) {
            message = `🎉 Amazing! ${score}/${quizData.length} - You're a Mario Master!`;
        } else if (percentage >= 70) {
            message = `👍 Great job! ${score}/${quizData.length} - You know your Mario!`;
        } else if (percentage >= 50) {
            message = `😊 Not bad! ${score}/${quizData.length} - Keep practicing!`;
        } else {
            message = `🤔 ${score}/${quizData.length} - Time to play more Mario games!`;
        }
    
        resultEl.textContent = message;
        resultEl.style.display = 'block'; // Ensure the result is visible
        
        // Show the overall score message
        const scoreMessage = `Your overall score is: ${score} out of ${quizData.length}.`;
        resultEl.innerHTML += `<br><br><strong>${scoreMessage}</strong>`;
        tryAgainBtn.style.display = 'inline-block';
        tryAgainBtn.focus();
    
        // Show the Back button
        const backBtn = document.getElementById('backBtn');
        backBtn.style.display = 'inline-block'; 
    
        // Event listener for the back button
        backBtn.addEventListener('click', () => {
        window.location.href = "quiz.html"; 
        });
    }
    
    // Try again button
    tryAgainBtn.addEventListener('click', () => {
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        progressBar.style.width = '0%';
        backBtn.style.display = 'none';
        resultEl.textContent = '';
        feedbackEl.textContent = '';
        tryAgainBtn.style.display = 'none';
        showQuestion(currentQuestionIndex);
    });
    
    // Updare progress bar after finishing one question
    function updateProgressBar(questionsAnswered) {
        const progressPercent = (questionsAnswered / quizData.length) * 100;
        progressBar.style.width = progressPercent + '%';
    }

    // Play sound effects
    function playSound(correct) {
        if (correct) {
        correctSound.currentTime = 0;
        correctSound.play();
        } else {
        wrongSound.currentTime = 0;
        wrongSound.play();
        }
    };
});

// Explanation

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        } 
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const pairs = [
        { videoId: 'video1', imageId: 'image1' },
        { videoId: 'video2', imageId: 'image2' },
        { videoId: 'video3', imageId: 'image3' },
        { videoId: 'video4', imageId: 'image4' },
        { videoId: 'submitVideo', imageId: 'submitImage' }
    ];
  
    pairs.forEach(({ videoId, imageId }) => {
        const video = document.getElementById(videoId);
        const image = document.getElementById(imageId);
    
        if (video && image) {
            video.addEventListener('ended', () => {
                video.style.display = 'none'; // Hide the video
                image.style.display = 'block'; // Show the image
            });
        }
    });
});