import { Combobox } from '@twilio-paste/core/combobox';
import React, { useEffect } from 'react';
import { useToaster, Toaster } from '@twilio-paste/core/toast';
import { Label } from '@twilio-paste/core';
import axios from 'axios';
import { Heading } from '@twilio-paste/core/heading';
import { Button } from '@twilio-paste/core/button';
import { Table, THead, Tr, Td, Th, TBody } from '@twilio-paste/core/table';
import { Modal, ModalBody, ModalFooter, ModalFooterActions, ModalHeader, ModalHeading } from '@twilio-paste/core/modal';
import { useUID } from '@twilio-paste/core/uid-library';
//import ReactFileReader from 'react-file-reader';
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";

let newData = []

export const SiteCampaigns = () => {
    
    
    useEffect(() => {
        

    }, []);
    return (
        <div id="body" style={{ width: '50%' }}>
            <Heading as="h1" variant="heading10">
                Outbound Campaign Contact List
            </Heading>
            <table>
                <tbody>
                    <tr>
                        <td>
                        </td>
                        <td></td>
                        <td></td>
                        <td>
                            <Label>&zwnj;</Label>
                        </td>
                    </tr>
                </tbody>
            </table>
            <br />
            <Table striped="true">
                <THead>
                    <Tr>
                        <Th><strong>Contacts</strong></Th>
                        <Th></Th>
                        <Th></Th>
                    </Tr>
                    <Tr>
                        <Th >Customer Number</Th>
                        <Th >Customer Name</Th>
                        <Th></Th>
                    </Tr>
                </THead>
                <TBody>
                  
                </TBody>
            </Table>
            <br />

        </div>
    )
};