document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {edge: 'right'});
    M.Carousel.init(document.querySelectorAll('.carousel'), {
        fullWidth: true,
        indicators: true
    });
    M.ScrollSpy.init(document.querySelectorAll('.scrollspy'));
    
    // Auto-play carousel
    setInterval(function() {
        const carouselInstance = M.Carousel.getInstance(document.querySelector('.carousel-slider'));
        if (carouselInstance) {
            carouselInstance.next();
        }
    }, 5000);
    
    // Show welcome message if it's the first visit
    if (!localStorage.getItem('welcomeShown')) {
        Swal.fire({
            title: 'Welcome to ResumeCraft!',
            text: 'Create a professional resume in minutes with our easy-to-use builder.',
            icon: 'info',
            confirmButtonText: 'Get Started',
            confirmButtonColor: '#4361ee'
        });
        
        localStorage.setItem('welcomeShown', 'true');
    }
    
    // Template selection
    document.querySelectorAll('.template-select').forEach(button => {
        button.addEventListener('click', function() {
            const template = this.dataset.template;
            localStorage.setItem('selectedTemplate', template);
        });
    });
    
    // Check for welcome message in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('welcome') === 'true') {
        Swal.fire(
            'Welcome to ResumeCraft!',
            'Start building your perfect resume now.',
            'success'
        );
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Initialize dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-trigger');
    if (dropdowns.length > 0) {
        M.Dropdown.init(dropdowns, {
            coverTrigger: false
        });
    }
});