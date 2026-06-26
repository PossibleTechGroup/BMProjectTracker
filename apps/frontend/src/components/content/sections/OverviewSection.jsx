'use client';
import { useDispatch, useSelector } from 'react-redux';
import { updateProjectField } from '@/store/slices/projectSlice';
import EditableField from '@/components/common/EditableField';
import { useEdit } from '@/components/common/EditContext';

export function PrevNextNav({ activeSection, onSelect }) {
  return null;
}

export function OverviewSection() {
  const platforms = useSelector(s => s.platforms.items) || [];
  const project = useSelector(s => s.project.data);
  const { editing } = useEdit();
  const dispatch = useDispatch();

  const pf = (field, value, type = 'textarea') => (
    <EditableField
      value={value || ''}
      onSave={v => dispatch(updateProjectField({ field, value: v }))}
      editing={editing}
      type={type}
    />
  );

  return (
    <></>
  );
}
