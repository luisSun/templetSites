//Aside no mobile (Precisa arrumar!)
var asideVisible = false;

        function toggleAside() {
            var aside = document.getElementById('aside');
            asideVisible = !asideVisible;
            aside.style.display = asideVisible ? 'block' : 'none';

            if (asideVisible) {
                document.addEventListener('click', closeAsideOutside);
            } else {
                document.removeEventListener('click', closeAsideOutside);
            }
        }

        function closeAsideOutside(event) {
            var aside = document.getElementById('aside');
            var asideSquare = document.getElementById('show-aside-square');
            if (!aside.contains(event.target) && event.target !== asideSquare) {
                aside.style.display = 'none';
                asideVisible = false;
                location.reload();
            }
        }

        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible' && asideVisible) {
                var aside = document.getElementById('aside');
                aside.style.display = 'block';
            }
        });