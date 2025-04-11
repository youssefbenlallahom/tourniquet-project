import React from 'react';
import { FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NoAccess = () => {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #e63946, #f1faee)',
    },
    content: {
      textAlign: 'center',
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.1)',
    },
    lockIcon: {
      fontSize: '80px',
      color: '#e63946',
      marginBottom: '20px',
    },
    title: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 'bold',
      color: '#1d3557',
      fontSize: '2.5rem',
      marginBottom: '20px',
    },
    description: {
      color: '#457b9d',
      fontSize: '1.2rem',
      marginBottom: '30px',
    },
    button: {
      backgroundColor: '#1d3557',
      color: 'white',
      padding: '10px 20px',
      fontSize: '16px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{ yoyo: Infinity, duration: 1 }}
        >
          <FaLock style={styles.lockIcon} />
        </motion.div>
        <h1 style={styles.title}>Oops! Accès refusé</h1>
        <p style={styles.description}>
          Il semble que vous n'ayez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Link to="/dashboard/home" style={styles.button}>
          Retour à la page d'accueil
        </Link>
      </motion.div>
    </div>
  );
};

export default NoAccess;
