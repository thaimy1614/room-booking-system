import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './Header';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

function DashboardLayout({ role }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Header />
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar role={role} />
          </Col>
          <Col md={10} className="p-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default DashboardLayout;