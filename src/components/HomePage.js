/**
 * @file HomePage.js
 * @location src/components/HomePage.js
 * @author Alexander Echeverria
 * @description Página principal de la farmacia con diseño Tailwind CSS
 *              Usa variables de entorno para toda la configuración
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, Phone, MapPin, Clock, Heart, Shield, Truck, 
  Star, ChevronRight, Mail, Facebook, Instagram, MessageCircle,
  Award, Users, Package, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';

const HomePage = () => {
  // Estados
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const navigate = useNavigate();

  // Variables de entorno
  const config = {
    companyName: process.env.REACT_APP_COMPANY_NAME || 'Farmacia',
    companySlogan: process.env.REACT_APP_COMPANY_SLOGAN || 'Tu salud es nuestra prioridad',
    companyDescription: process.env.REACT_APP_COMPANY_DESCRIPTION || '',
    phone: process.env.REACT_APP_PHONE || '',
    phoneSecondary: process.env.REACT_APP_PHONE_SECONDARY || '',
    email: process.env.REACT_APP_EMAIL || '',
    address: process.env.REACT_APP_ADDRESS || '',
    schedule: process.env.REACT_APP_SCHEDULE || '',
    facebook: process.env.REACT_APP_FACEBOOK || '',
    instagram: process.env.REACT_APP_INSTAGRAM || '',
    whatsapp: process.env.REACT_APP_WHATSAPP || '',
    logoPath: process.env.REACT_APP_LOGO_PATH || '/images/logo.png',
    heroTitle: process.env.REACT_APP_HERO_TITLE || 'Bienvenido',
    heroSubtitle: process.env.REACT_APP_HERO_SUBTITLE || '',
    heroImage: process.env.REACT_APP_HERO_IMAGE || '',
    statsYears: process.env.REACT_APP_STATS_YEARS || '20+',
    statsClients: process.env.REACT_APP_STATS_CLIENTS || '5000+',
    statsProducts: process.env.REACT_APP_STATS_PRODUCTS || '10000+',
    statsRating: process.env.REACT_APP_STATS_RATING || '4.9',
    emergencyPhone: process.env.REACT_APP_EMERGENCY_PHONE || '123',
    emergencyMessage: process.env.REACT_APP_EMERGENCY_MESSAGE || '',
  };

  // Características desde .env
  const features = [
    {
      icon: <Heart className="w-10 h-10" />,
      title: process.env.REACT_APP_FEATURE_1_TITLE || 'Atención Personalizada',
      description: process.env.REACT_APP_FEATURE_1_DESC || 'Farmacéuticos profesionales a tu servicio',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: process.env.REACT_APP_FEATURE_2_TITLE || 'Productos Certificados',
      description: process.env.REACT_APP_FEATURE_2_DESC || 'Medicamentos con registro sanitario',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Truck className="w-10 h-10" />,
      title: process.env.REACT_APP_FEATURE_3_TITLE || 'Entrega a Domicilio',
      description: process.env.REACT_APP_FEATURE_3_DESC || 'Llevamos tus medicamentos a tu hogar',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  // Servicios adicionales desde .env
  const services = [
    process.env.REACT_APP_SERVICE_1,
    process.env.REACT_APP_SERVICE_2,
    process.env.REACT_APP_SERVICE_3,
    process.env.REACT_APP_SERVICE_4,
    process.env.REACT_APP_SERVICE_5
  ].filter(Boolean);

  // Testimonios de ejemplo
  const testimonials = [
    {
      name: 'María González',
      comment: 'Excelente servicio y atención. Siempre encuentro lo que necesito y el personal es muy amable.',
      rating: 5,
      image: '👩'
    },
    {
      name: 'Carlos Méndez',
      comment: 'Personal muy profesional y amable. Los precios son justos y la calidad es garantizada.',
      rating: 5,
      image: '👨'
    },
    {
      name: 'Ana Rodríguez',
      comment: 'La entrega a domicilio es rápida y confiable. Muy recomendado para toda la familia.',
      rating: 5,
      image: '👩‍⚕️'
    }
  ];

  // Estadísticas
  const stats = [
    { icon: <Award className="w-8 h-8" />, value: config.statsYears, label: 'Años de Experiencia' },
    { icon: <Users className="w-8 h-8" />, value: config.statsClients, label: 'Clientes Satisfechos' },
    { icon: <Package className="w-8 h-8" />, value: config.statsProducts, label: 'Productos Disponibles' },
    { icon: <Star className="w-8 h-8" />, value: config.statsRating, label: 'Calificación Promedio' }
  ];

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotación de testimonios
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white">
      
      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg' 
          : 'bg-gradient-to-r from-blue-600 via-green-500 to-yellow-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo y Nombre */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isScrolled ? 'bg-gradient-to-r from-blue-600 to-green-500' : 'bg-white'
              }`}>
                <Heart className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-blue-600'}`} />
              </div>
              <span className={`text-lg sm:text-xl font-bold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                {config.companyName}
              </span>
            </div>

            {/* Navegación Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-yellow-300'
              }`}>
                Inicio
              </a>
              <a href="#servicios" className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-yellow-300'
              }`}>
                Servicios
              </a>
              <a href="#sobre-nosotros" className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-yellow-300'
              }`}>
                Nosotros
              </a>
              <a href="#contacto" className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-yellow-300'
              }`}>
                Contacto
              </a>
            </div>

            {/* Botón Login Desktop */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => navigate('/login')}
                className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                  isScrolled 
                    ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white text-blue-600 shadow-lg hover:shadow-xl'
                }`}
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Menú Móvil Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-all"
            >
              {isMenuOpen ? (
                <X className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Menú Móvil Desplegable */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a 
                href="#inicio" 
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </a>
              <a 
                href="#servicios" 
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Servicios
              </a>
              <a 
                href="#sobre-nosotros" 
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Nosotros
              </a>
              <a 
                href="#contacto" 
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </a>
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/login');
                  }}
                  className="block w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section id="inicio" className="pt-16 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            
            {/* Contenido */}
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-block animate-bounce">
                <span className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  ¡Estamos aquí para ti!
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-green-500 to-yellow-500 bg-clip-text text-transparent">
                  {config.heroTitle}
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 font-medium">
                {config.heroSubtitle || config.companySlogan}
              </p>
              
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                {config.companyDescription}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Iniciar Sesión</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <a
                  href="#contacto"
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Contáctanos</span>
                </a>
              </div>

              {/* Información de Contacto Rápido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                {config.phone && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Llámanos</p>
                      <p className="font-semibold">{config.phone}</p>
                    </div>
                  </div>
                )}
                
                {config.schedule && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Horario</p>
                      <p className="font-semibold text-sm">{config.schedule}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Imagen/Ilustración */}
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl p-8 sm:p-12 shadow-2xl">
                {config.heroImage ? (
                  <img 
                    src={config.heroImage} 
                    alt="Farmacia" 
                    className="w-full h-auto rounded-2xl shadow-lg"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-xl">
                      <Heart className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{config.companySlogan}</h3>
                    <p className="text-gray-600">Más de {config.statsYears} años cuidando tu salud</p>
                  </div>
                )}
              </div>
              
              {/* Decoración */}
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-yellow-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ESTADÍSTICAS ========== */}
      {process.env.REACT_APP_SHOW_STATS !== 'false' && (
        <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 via-green-500 to-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center text-white transform hover:scale-110 transition-transform">
                  <div className="flex justify-center mb-3">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-2">{stat.value}</h3>
                  <p className="text-sm sm:text-base opacity-90">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== CARACTERÍSTICAS ========== */}
      <section id="servicios" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                ¿Por qué elegirnos?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Nos comprometemos con tu bienestar ofreciendo servicios de calidad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
              >
                {/* Icono con gradient */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decoración */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${feature.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SERVICIOS ADICIONALES ========== */}
      {services.length > 0 && process.env.REACT_APP_SHOW_SERVICES !== 'false' && (
        <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Servicios Adicionales
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                Más que una farmacia, tu centro de salud integral
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-4 bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium text-gray-800">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== TESTIMONIOS ========== */}
      {process.env.REACT_APP_SHOW_TESTIMONIALS !== 'false' && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-500 to-blue-600 bg-clip-text text-transparent">
                  Lo que dicen nuestros clientes
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                La satisfacción de nuestros clientes es nuestra mejor recompensa
              </p>
            </div>

            <div className="relative bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl p-8 sm:p-12 shadow-xl">
              <div className="text-center space-y-6">
                <div className="text-6xl">{testimonials[currentTestimonial].image}</div>
                
                <div className="flex justify-center space-x-1 mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-lg sm:text-xl text-gray-700 italic leading-relaxed">
                  "{testimonials[currentTestimonial].comment}"
                </p>
                
                <p className="text-lg font-semibold text-gray-800">
                  {testimonials[currentTestimonial].name}
                </p>
              </div>

              {/* Indicadores */}
              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentTestimonial === index 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== LLAMADO A LA ACCIÓN ========== */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 via-green-500 to-yellow-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para cuidar tu salud?
          </h2>
          <p className="text-lg sm:text-xl text-white mb-8 opacity-90">
            Únete a miles de clientes satisfechos que confían en nosotros
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
          >
            <span>Comenzar Ahora</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* ========== CONTACTO ========== */}
      {process.env.REACT_APP_SHOW_CONTACT !== 'false' && (
        <section id="contacto" className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Contáctanos
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.phone && (
                <a
                  href={`tel:${config.phone}`}
                  className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Teléfono</h3>
                  <p className="text-sm text-gray-600 text-center">{config.phone}</p>
                </a>
              )}

              {config.whatsapp && (
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">WhatsApp</h3>
                  <p className="text-sm text-gray-600 text-center">{config.whatsapp}</p>
                </a>
              )}

              {config.email && (
                <a
                  href={`mailto:${config.email}`}
                  className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-7 h-7 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
                  <p className="text-sm text-gray-600 text-center break-all">{config.email}</p>
                </a>
              )}

              {config.address && (
                <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Ubicación</h3>
                  <p className="text-sm text-gray-600 text-center">{config.address}</p>
                </div>
              )}
            </div>

            {/* Emergencias */}
            {config.emergencyPhone && (
              <div className="mt-12 bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <h3 className="text-xl font-bold text-red-600">Emergencias</h3>
                </div>
                <p className="text-gray-700 mb-2">{config.emergencyMessage}</p>
                <a 
                  href={`tel:${config.emergencyPhone}`}
                  className="inline-block text-2xl font-bold text-red-600 hover:text-red-700"
                >
                  {config.emergencyPhone}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== FOOTER ========== */}
      <footer id="sobre-nosotros" className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            
            {/* Columna 1: Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">{config.companyName}</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {config.companyDescription || config.companySlogan}
              </p>
            </div>

            {/* Columna 2: Enlaces */}
            <div>
              <h4 className="text-lg font-bold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#inicio" className="text-gray-400 hover:text-white transition-colors">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="text-gray-400 hover:text-white transition-colors">
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="#sobre-nosotros" className="text-gray-400 hover:text-white transition-colors">
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a href="#contacto" className="text-gray-400 hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 3: Redes Sociales */}
            <div>
              <h4 className="text-lg font-bold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                {config.facebook && (
                  <a
                    href={config.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {config.instagram && (
                  <a
                    href={config.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {config.whatsapp && (
                  <a
                    href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Horario */}
              {config.schedule && (
                <div className="mt-6">
                  <h5 className="font-semibold mb-2">Horario de Atención</h5>
                  <p className="text-gray-400 text-sm">{config.schedule}</p>
                </div>
              )}
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} {config.companyName}. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Desarrollado por AE para tu salud
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;