document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {edge: 'right'});
    M.Carousel.init(document.querySelectorAll('.carousel'), {
        fullWidth: true,
        indicators: true
    });
    M.ScrollSpy.init(document.querySelectorAll('.scrollspy'));
    
    // Show welcome message
    Swal.fire({
        title: 'Welcome to ResumeCraft!',
        text: 'Create a professional resume in minutes with our easy-to-use builder.',
        icon: 'info',
        confirmButtonText: 'Get Started',
        confirmButtonColor: '#2196F3'
    });
});

// Main JavaScript for non-dashboard pages

// Initialize Materialize components
document.addEventListener('DOMContentLoaded', function() {
    // Modals
    const modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    
    // Sidenav
    const sidenavs = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavs);
    
    // Carousel
    const carousels = document.querySelectorAll('.carousel');
    M.Carousel.init(carousels, {
        fullWidth: true,
        indicators: true
    });
    
    // ScrollSpy
    const scrollspys = document.querySelectorAll('.scrollspy');
    M.ScrollSpy.init(scrollspys);
    
    // Auto-play carousel
    setInterval(function() {
        const carouselInstance = M.Carousel.getInstance(document.querySelector('.carousel-slider'));
        if (carouselInstance) {
            carouselInstance.next();
        }
    }, 5000);
});

// Template selection
document.querySelectorAll('.template-select').forEach(button => {
    button.addEventListener('click', function() {
        const template = this.dataset.template;
        localStorage.setItem('selectedTemplate', template);
    });
});

// Check for welcome message
document.addEventListener('DOMContentLoaded', function() {
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
});