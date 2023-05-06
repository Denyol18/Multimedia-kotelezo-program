document.addEventListener('DOMContentLoaded', () => {
   const grid = document.querySelector('#grid');
   const toplist = document.querySelector('#toplist');
   const btn = document.querySelector('#score_submit');
   const colors = ['red', 'yellow', 'blue', 'orange', 'purple'];
   const width = 8;
   const start_height = 5;

   let music = new Audio('sounds/music.m4a');
   let pickup_sound = new Audio('sounds/pickup.wav');
   let drop_sound = new Audio('sounds/drop.wav');
   let score_sound = new Audio('sounds/score.mp3');

   music.loop = true;
   music.volume = 0.4;
   score_sound.volume = 0.3;

   let stored_rects = [];
   let storing = false;
   let start = false;

   let score = 0;
   let base_reward = 100;
   let minute = 0;
   let second = 0;
   let millisecond = 0;
   let timer_for_adding = 0;
   let time;
   let divider = 15;

   let op = 1;


   btn.addEventListener('click', function () {
      let nickname = document.getElementById('nickname').value;
      if(!nickname) {
         alert('Nickname is required!');
      }
      else {
         localStorage.setItem(nickname, score);
         alert('Score submit successful!');
         location.reload();
      }
   });

   function createBoard() {
      let rect_col = 1;

      for (let i = 0; i < width; i++) {
         let rect_row = 1;

         const col = document.createElement('div');
         col.id = rect_col;

         for (let j = 0; j < start_height; j++) {
            const rect = document.createElement('div');
            rect.setAttribute('row', rect_row);
            rect.setAttribute('col', rect_col);
            let randomColor = Math.floor(Math.random() * colors.length);
            rect.style.background = colors[randomColor];
            rect.setAttribute('color', colors[randomColor]);
            col.appendChild(rect);
            rect_row++;
         }

         rect_col++;
         grid.appendChild(col);
      }
   }

   function clickOnBoard(event)  /* Csak a teglalapok ala valo kattintasok mukodnek, nem bug */ {
      let pos = event.target.id;


      if (!start && pos) {
         start = true;
         startGame();
      }

      if (!storing) {
         removeRects(pos);
         if (stored_rects.length !== 0) {
            storing = true;
         }

      }
      else {
         addToCol(pos);
         let decider =  isGameOver(pos);
         if(!decider) {
            checkForFour(pos);
         }
         storing = false;
      }
   }

   function addRects() {

      let colNum = 1;
      let rect_row = 1;

      for (let i = 0; i < width; i++) {
         let col = document.getElementById(colNum);
         let colRects = col.getElementsByTagName('div');

         const rect = document.createElement('div');
         rect.setAttribute('row', rect_row);
         rect.setAttribute('col', colNum);
         let randomColor = Math.floor(Math.random() * colors.length);
         rect.style.background = colors[randomColor];
         rect.setAttribute('color', colors[randomColor]);
         col.insertBefore(rect, colRects[rect_row-1]);
         colNum++;
      }

      renameRectRowsAfterAdd();
      colNum = 1;
      for (let i = 0; i < width; i++) {
         isGameOver(colNum);
         colNum++;
      }

   }

   function renameRectRowsAfterAdd() {
      let colNum = 1;
      for (let i = 0; i < width; i++) {
         let helper = 1;
         let col = document.getElementById(colNum);
         let colRects = col.getElementsByTagName('div');
         for (let i = 0; i < colRects.length; i++) {
            colRects[i].setAttribute('row', helper);
            helper++;
         }
         colNum++;
      }
   }

   function removeRects(colNum) {
      let rects = grid.querySelectorAll('div[col="' + colNum + '"]');

      if (rects.length !== 0) {
         for (let i = rects.length-1; i > -1; i--) {

            let color = rects[i].getAttribute('color');
            let status = rects[i].getAttribute('hidden');

            if(status !== 'true') {
               stored_rects.unshift(rects[i]);
               let timer = setInterval(function () {
                  if (op <= 0.1){
                     clearInterval(timer);
                     rects[i].remove();
                  }
                  rects[i].style.opacity = op;
                  rects[i].style.filter = 'alpha(opacity=' + op * 100 + ")";
                  op -= op * 0.25;
               }, 20);


               if (rects[i-1] !== undefined && color === rects[i-1].getAttribute('color')) {
                  stored_rects.unshift(rects[i-1]);
                  let timer = setInterval(function () {
                     if (op <= 0.1){
                        clearInterval(timer);
                        rects[i-1].remove();
                     }
                     rects[i-1].style.opacity = op;
                     rects[i-1].style.filter = 'alpha(opacity=' + op * 100 + ")";
                     op -= op * 0.25;
                  }, 20);

                  if(rects[i-2] !== undefined && color === rects[i-2].getAttribute('color')) {
                     stored_rects.unshift(rects[i-2]);
                     let timer = setInterval(function () {
                        if (op <= 0.1){
                           clearInterval(timer);
                           rects[i-2].remove();
                        }
                        rects[i-2].style.opacity = op;
                        rects[i-2].style.filter = 'alpha(opacity=' + op * 100 + ")";
                        op -= op * 0.25;
                     }, 20);
                  }
                  break;
               }
               else break;
            }
         }
      }
      if (stored_rects.length !== 0) {
         pickup_sound.play();
      }
   }

   function addToCol(colNum) {
      let helper = 1;
      let col = document.getElementById(colNum);
      let colRects = col.getElementsByTagName('div');
      for (let i = 0; i < stored_rects.length; i++) {
         stored_rects[i].setAttribute('row', colRects.length+helper);
         stored_rects[i].setAttribute('col', colNum);
         col.appendChild(stored_rects[i]);
         let last_rect = document.getElementById(colNum).lastChild;
         let timer = setInterval(function () {
            if (op >= 1){
               clearInterval(timer);
            }
            last_rect.style.opacity = op;
            last_rect.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op += op * 0.25;
         }, 10);

      }
      drop_sound.play();
      stored_rects = [];
   }

   function checkForFour(colNum) {
      let rects = grid.querySelectorAll('div[col="' + colNum + '"]');
      let i = rects.length - 1;

      if (rects.length !== 0) {
         let color = rects[i].getAttribute('color');
         let status = rects[i].getAttribute('hidden');

         if (status !== 'true' && rects[i - 1] !== undefined &&
             color === rects[i - 1].getAttribute('color') &&
             rects[i - 2] !== undefined &&
             color === rects[i - 2].getAttribute('color') &&
             rects[i - 3] !== undefined &&
             color === rects[i - 3].getAttribute('color')) {

            rects[i].remove();
            rects[i - 1].remove();
            rects[i - 2].remove();
            rects[i - 3].remove();
            score += 4 * base_reward;

            for (i = rects.length - 5; i > -1; i--) {
               if (rects[i] !== undefined &&
                   color === rects[i].getAttribute('color')) {
                  rects[i].remove();
                  score += base_reward;
               } else break;
            }
            document.querySelector('#score').innerHTML = score;
            score_sound.play();
            return true;
         }
         else return false;
      }
   }

   function isGameOver(colNum) {
      let col = document.getElementById(colNum);
      let colRects = col.getElementsByTagName('div');
      if (colRects.length === 10) {
         let decider = checkForFour(colNum);
         if (decider === false) {
            stop();
            grid.remove();
            document.getElementById('nickname').disabled = false;
            document.getElementById('score_submit').disabled = false;
            music.pause();
            alert('Game Over!');
            return true;
         }
      }
      else if (colRects.length > 10) {
         stop();
         grid.remove();
         document.getElementById('nickname').disabled = false;
         document.getElementById('score_submit').disabled = false;
         music.pause();
         alert('Game Over!');
         return true;
      }
   }

   function startGame() {
      time = setInterval(() => {timer(); }, 10);
      music.play();
   }

   function stop() {
      clearInterval(time);
   }

   function timer() {
      if ((millisecond += 10) === 1000) {
         millisecond = 0;
         second++;
         timer_for_adding++;
         if(timer_for_adding % divider === 0)  {
            addRects();
            timer_for_adding = 0;
            if (divider !== 2) {
               --divider;
            }
         }
      }
      if (second === 60) {
         second = 0;
         minute++;
      }
      document.getElementById('minute').innerText = returnData(minute);
      document.getElementById('second').innerText = returnData(second);
   }

   function returnData(input) {
      return input >= 10 ? input : `0${input}`
   }

   function fillTopList() {
      let items = {...localStorage};
      let sortable = [];

      for (let itemsKey in items) {
         sortable.push([itemsKey, items[itemsKey]]);
      }

      sortable.sort(function (a,b) {
         return b[1] - a[1];
      });

      for (let i = 0; i < 10; i++) {
         if (sortable[i] === undefined) continue;
         const player_stat = document.createElement('div');
         player_stat.className = 'player';
         player_stat.innerHTML = sortable[i.toString()];
         toplist.appendChild(player_stat);
      }
   }

   createBoard();
   fillTopList();
   grid.addEventListener('click', clickOnBoard);

});
