<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicSession extends Model
{
    use SoftDeletes;

    protected $table = 'academic_sessions';

    protected $fillable = [
        'session_label',
        'session_status',
        'is_current',
        'start_date',
        'end_date',
        'created_by',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ── Relationships ──
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Scopes ──
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    public function scopeActive($query)
    {
        return $query->where('session_status', 'Active');
    }

    public function scopeArchived($query)
    {
        return $query->where('session_status', 'Archived');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('session_status', 'Upcoming');
    }

    // ── Helper Methods ──
    public function isActive(): bool
    {
        return $this->session_status === 'Active';
    }

    public function isArchived(): bool
    {
        return $this->session_status === 'Archived';
    }

    public function isUpcoming(): bool
    {
        return $this->session_status === 'Upcoming';
    }

    public function isCurrent(): bool
    {
        return $this->is_current === true;
    }

    // ── Boot method for auto-creating UUID ──
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }
}