import React from 'react';
import { useParams } from 'react-router-dom';
const AdminOrderDetail = () => {
  const { id } = useParams();
  return <div><h1>Order Detail {id}</h1></div>;
};
export default AdminOrderDetail;