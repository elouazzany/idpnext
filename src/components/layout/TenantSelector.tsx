import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, Check, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import * as Popover from '@radix-ui/react-popover';

export function TenantSelector() {
    const { currentTenant, availableTenants, switchTenant } = useAuth();
    const [open, setOpen] = React.useState(false);

    if (availableTenants.length === 0) return null;

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    className={clsx(
                        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors border",
                        open ? "bg-gray-100 border-gray-300" : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                >
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 max-w-[150px] truncate">
                        {currentTenant?.name || 'Select Tenant'}
                    </span>
                    <ChevronDown className={clsx("h-3 w-3 text-gray-400 transition-transform", open && "rotate-180")} />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className="z-50 w-[240px] rounded-md bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 slide-in-from-top-2"
                    align="start"
                    sideOffset={4}
                >
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Switch Tenant
                    </div>
                    <div className="space-y-0.5">
                        {availableTenants.map((tenant) => (
                            <button
                                key={tenant.id}
                                onClick={() => {
                                    switchTenant(tenant.id);
                                    setOpen(false);
                                }}
                                className={clsx(
                                    "flex w-full items-center justify-between px-2 py-2 text-sm rounded-md transition-colors",
                                    currentTenant?.id === tenant.id
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="truncate font-medium">{tenant.name}</span>
                                    {tenant.description && (
                                        <span className="text-xs text-gray-500 truncate max-w-[180px]">
                                            {tenant.description}
                                        </span>
                                    )}
                                </div>
                                {currentTenant?.id === tenant.id && (
                                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                                )}
                            </button>
                        ))}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
