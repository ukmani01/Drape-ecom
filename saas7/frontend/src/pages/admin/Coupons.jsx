import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/coupons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const couponSchema = z.object({
  code: z.string().min(2).max(20),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).default(0),
  usageLimit: z.number().int().min(1).default(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

const AdminCoupons = () => {
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { type: 'percentage', value: 10, minOrderAmount: 0, maxDiscount: 0, usageLimit: 1, isActive: true },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => getCoupons().then(res => res.data.data),
  });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-coupons']);
      toast.success('Coupon created');
      setIsModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-coupons']);
      toast.success('Coupon updated');
      setIsModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-coupons']);
      toast.success('Coupon deleted');
    },
  });

  const onSubmit = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ type: 'percentage', value: 10, minOrderAmount: 0, maxDiscount: 0, usageLimit: 1, isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    reset(coupon);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">Coupons</h1>
        <Button onClick={openCreate}><FiPlus className="mr-2" /> Add Coupon</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Uses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.docs.map((coupon) => (
                <tr key={coupon._id} className="border-b hover:bg-secondary-50">
                  <td className="p-3 font-mono">{coupon.code}</td>
                  <td>{coupon.type}</td>
                  <td>{coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}</td>
                  <td>{coupon.minOrderAmount ? formatCurrency(coupon.minOrderAmount) : 'None'}</td>
                  <td>{coupon.usedCount}/{coupon.usageLimit}</td>
                  <td><span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-danger'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button onClick={() => openEdit(coupon)} className="text-primary-500 hover:underline mr-2"><FiEdit2 /></button>
                    <button onClick={() => deleteMutation.mutate(coupon._id)} className="text-red-500 hover:underline"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Coupon' : 'Create Coupon'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Code" {...register('code')} error={errors.code?.message} />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label-luxury">Type</label>
              <select {...register('type')} className="input-luxury">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="flex-1">
              <Input label="Value" type="number" {...register('value', { valueAsNumber: true })} error={errors.value?.message} />
            </div>
          </div>
          <Input label="Min Order Amount" type="number" {...register('minOrderAmount', { valueAsNumber: true })} error={errors.minOrderAmount?.message} />
          <Input label="Max Discount" type="number" {...register('maxDiscount', { valueAsNumber: true })} error={errors.maxDiscount?.message} />
          <Input label="Usage Limit" type="number" {...register('usageLimit', { valueAsNumber: true })} error={errors.usageLimit?.message} />
          <div className="flex gap-4">
            <Input label="Start Date" type="date" {...register('startDate')} />
            <Input label="End Date" type="date" {...register('endDate')} />
          </div>
          <div className="flex items-center">
            <input type="checkbox" {...register('isActive')} id="isActive" className="mr-2" />
            <label htmlFor="isActive" className="label-luxury">Active</label>
          </div>
          <Button type="submit" className="w-full" loading={createMutation.isLoading || updateMutation.isLoading}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoupons;
