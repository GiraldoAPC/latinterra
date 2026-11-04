<?php

namespace App\Mail;

use App\Models\Ventas\Quote;
use Illuminate\Mail\Mailable;

class QuoteMail extends Mailable
{
    public function __construct(public Quote $quote, public string $pdf, public ?string $personalMessage = null)
    {
    }

    public function build(): self
    {
        return $this->subject('Cotización '.$this->quote->code.' · Latin Terra')
            ->view('emails.quote')
            ->attachData($this->pdf, $this->quote->code.'.pdf', ['mime' => 'application/pdf']);
    }
}
